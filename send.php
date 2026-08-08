<?php

function load_env($path) {
    if (!is_readable($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key === '') {
            continue;
        }

        if (
            strlen($value) >= 2
            && (($value[0] === '"' && substr($value, -1) === '"') || ($value[0] === "'" && substr($value, -1) === "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        putenv($key . '=' . $value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

load_env(__DIR__ . '/.env');

$token = getenv('TELEGRAM_BOT_TOKEN');
$chat_id = getenv('TELEGRAM_CHAT_ID');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

function post_value($key) {
    return isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
}

function normalize_event_date($value) {
    if ($value === '') {
        return '';
    }

    $timezone = new DateTimeZone('Europe/Minsk');
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, $timezone);
    $errors = DateTimeImmutable::getLastErrors();
    $has_errors = is_array($errors) && ($errors['warning_count'] > 0 || $errors['error_count'] > 0);

    if ($date === false || $has_errors || $date->format('Y-m-d') !== $value) {
        return '';
    }

    return $date->format('Y-m-d');
}

function normalize_available_offer_types($value) {
    $allowed = array(
        'early_booking_gift',
        'bundle_discount',
        'available_date_offer',
    );
    $types = array();

    foreach (explode(',', (string) $value) as $type) {
        $type = trim($type);
        if ($type !== '' && in_array($type, $allowed, true) && !in_array($type, $types, true)) {
            $types[] = $type;
        }
    }

    return implode(',', $types);
}

function days_until_event($event_date) {
    if ($event_date === '') {
        return '';
    }

    $timezone = new DateTimeZone('Europe/Minsk');
    $event = new DateTimeImmutable($event_date, $timezone);
    $today = new DateTimeImmutable('today', $timezone);
    return $today->diff($event)->format('%r%a');
}

function build_offer_context() {
    $type = post_value('offer_type');
    $name = post_value('offer_name');
    $value = post_value('offer_value');
    $definitions = array(
        'early_booking_gift' => array(
            'offer_name' => 'Декор до 100 BYN за раннее бронирование',
            'offer_value' => 'decor_up_to_100_byn',
        ),
        'bundle_discount' => array(
            'offer_name' => 'Скидка 10% на дополнительную зону',
            'offer_value' => '10_percent_additional_zone',
        ),
        'available_date_offer' => array(
            'offer_name' => 'Специальное предложение на свободную дату',
            'offer_value' => 'individual_date_offer',
        ),
        'special_offer_consultation' => array(
            'offer_name' => 'Подбор специального предложения',
            'offer_value' => 'manager_selects_best_offer',
        ),
        'project_quote' => array(
            'offer_name' => 'Расчёт выбранной фотозоны',
            'offer_value' => 'individual_project_calculation',
        ),
    );

    if (isset($definitions[$type])) {
        $name = $definitions[$type]['offer_name'];
        $value = $definitions[$type]['offer_value'];
    }

    $event_date = normalize_event_date(post_value('date'));
    $available_offer_types = normalize_available_offer_types(post_value('available_offer_types'));
    if ($type === 'special_offer_consultation' && $available_offer_types === '') {
        $available_offer_types = 'early_booking_gift,bundle_discount,available_date_offer';
    }
    $early_booking_eligible = '';
    $days_until_event = days_until_event($event_date);
    if (($type === 'early_booking_gift' || $type === 'special_offer_consultation') && $event_date !== '') {
        $timezone = new DateTimeZone('Europe/Minsk');
        $event = new DateTimeImmutable($event_date, $timezone);
        $threshold = new DateTimeImmutable('today', $timezone);
        $threshold = $threshold->modify('+30 days');
        $early_booking_eligible = $event >= $threshold ? 'yes' : 'no';
    }

    return array(
        'offer_type' => $type,
        'offer_name' => $name,
        'offer_value' => $value,
        'available_offer_types' => $available_offer_types,
        'offer_page' => post_value('offer_page'),
        'offer_location' => post_value('offer_location'),
        'event_date' => $event_date,
        'days_until_event' => $days_until_event,
        'requested_services' => post_value('requested_services'),
        'early_booking_eligible' => $early_booking_eligible,
    );
}

function offer_requires_event_date($offer_type) {
    return in_array($offer_type, array('early_booking_gift', 'available_date_offer', 'special_offer_consultation'), true);
}

function offer_event_date_is_past($event_date) {
    if ($event_date === '') {
        return false;
    }

    $timezone = new DateTimeZone('Europe/Minsk');
    $event = new DateTimeImmutable($event_date, $timezone);
    $today = new DateTimeImmutable('today', $timezone);
    return $event < $today;
}

function expects_json_response() {
    $requested_with = isset($_SERVER['HTTP_X_REQUESTED_WITH'])
        ? strtolower((string) $_SERVER['HTTP_X_REQUESTED_WITH'])
        : '';
    $accept = isset($_SERVER['HTTP_ACCEPT']) ? (string) $_SERVER['HTTP_ACCEPT'] : '';

    return $requested_with === 'xmlhttprequest' || strpos($accept, 'application/json') !== false;
}

function send_json_response($success, $data = array(), $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

    echo json_encode(
        array_merge(array('success' => (bool) $success), $data),
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    exit;
}

function add_line(&$lines, $label, $value) {
    if ($value === '') {
        return;
    }

    $lines[] = '<b>' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . ':</b> ' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function form_name_value() {
    $allowed = array(
        'main_contact_form',
        'consultation_form',
        'pdf_download_form',
        'callback_form',
        'exit_popup_form',
        'payetki_booking_form',
    );
    $value = post_value('form_name');

    return in_array($value, $allowed, true) ? $value : 'website_form';
}

function source_page_path() {
    $referrer = isset($_SERVER['HTTP_REFERER']) ? (string) $_SERVER['HTTP_REFERER'] : '';
    $path = $referrer !== '' ? parse_url($referrer, PHP_URL_PATH) : '/';

    return is_string($path) && $path !== '' ? $path : '/';
}

function lead_source_label($form_location, $source) {
    $locations = array(
        'portfolio_card' => 'Карточка проекта',
        'seo_gallery_card' => 'Карточка проекта',
        'portfolio_lightbox' => 'Просмотр проекта',
        'seo_project_page' => 'Страница проекта',
        'seo_header' => 'Шапка сайта',
        'seo_general_inquiry' => 'Общая заявка',
        'service_package' => 'Пакет услуг',
        'seo_service_package' => 'Пакет услуг',
        'seo_hero' => 'Кнопка в первом экране',
        'seo_inline_cta' => 'CTA в тексте',
        'seo_final_cta' => 'Финальный CTA',
        'seo_mobile_cta' => 'Мобильная кнопка',
        'promotion_cta' => 'Промо-блок',
        'special_offer_cta' => 'Специальные условия',
        'seo_special_offer' => 'Специальное предложение',
        'seo_special_offer_bundle' => 'Комплексное предложение',
        'seo_blog_offer' => 'Предложение в статье',
        'payetki_project_page' => 'Страница проекта',
        'payetki_project_card' => 'Карточка проекта',
        'payetki_special_offer' => 'Специальное предложение',
    );

    return isset($locations[$form_location]) ? $locations[$form_location] : $source;
}

function render_success_redirect(
    $redirect_url,
    $form_name,
    $page_path,
    $lead_source = 'website_form',
    $selected_color = '',
    $selected_project = '',
    $form_location = '',
    $offer_context = array()
) {
    $json_flags = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
    $redirect_json = json_encode($redirect_url, $json_flags);
    $form_name_json = json_encode($form_name ?: 'website_form', $json_flags);
    $page_path_json = json_encode($page_path ?: '/', $json_flags);
    $lead_source_json = json_encode($lead_source ?: 'website_form', $json_flags);
    $selected_color_json = json_encode($selected_color, $json_flags);
    $selected_project_json = json_encode($selected_project, $json_flags);
    $form_location_json = json_encode($form_location ?: $form_name, $json_flags);
    $offer_type_json = json_encode(isset($offer_context['offer_type']) ? $offer_context['offer_type'] : '', $json_flags);
    $offer_name_json = json_encode(isset($offer_context['offer_name']) ? $offer_context['offer_name'] : '', $json_flags);
    $offer_value_json = json_encode(isset($offer_context['offer_value']) ? $offer_context['offer_value'] : '', $json_flags);
    $available_offer_types_json = json_encode(isset($offer_context['available_offer_types']) ? $offer_context['available_offer_types'] : '', $json_flags);
    $offer_page_json = json_encode(isset($offer_context['offer_page']) ? $offer_context['offer_page'] : '', $json_flags);
    $offer_location_json = json_encode(isset($offer_context['offer_location']) ? $offer_context['offer_location'] : '', $json_flags);
    $event_date_json = json_encode(isset($offer_context['event_date']) ? $offer_context['event_date'] : '', $json_flags);
    $requested_services_json = json_encode(isset($offer_context['requested_services']) ? $offer_context['requested_services'] : '', $json_flags);
    $early_booking_eligible_json = json_encode(isset($offer_context['early_booking_eligible']) ? $offer_context['early_booking_eligible'] : '', $json_flags);

    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    ?>
<!doctype html>
<html lang="ru">
<head>
<!-- Google Tag Manager -->
<script>
(function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({
        'gtm.start': new Date().getTime(),
        event:'gtm.js'
    });
    var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),
        dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MMKLD7DN');
</script>
<!-- End Google Tag Manager -->
    <meta charset="utf-8">
    <meta name="robots" content="noindex,nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Заявка отправлена</title>
    <style>
        * { box-sizing: border-box; }
        body {
            min-height: 100vh;
            margin: 0;
            display: grid;
            place-items: center;
            padding: 24px;
            color: #08090d;
            background:
                radial-gradient(circle at 82% 12%, rgba(185, 167, 216, 0.34), transparent 30rem),
                #f4f5f7;
            font-family: Inter, Arial, sans-serif;
        }
        .success-card {
            width: min(560px, 100%);
            padding: clamp(32px, 7vw, 56px);
            border: 1px solid rgba(8, 9, 13, 0.09);
            border-radius: 26px;
            text-align: center;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 28px 70px rgba(8, 9, 13, 0.14);
        }
        .success-mark {
            width: 64px;
            height: 64px;
            margin: 0 auto 22px;
            display: grid;
            place-items: center;
            border-radius: 20px;
            color: #71618f;
            background: rgba(217, 209, 232, 0.64);
            font-size: 30px;
            font-weight: 900;
        }
        h1 {
            margin: 0;
            font-family: Georgia, serif;
            font-size: clamp(30px, 6vw, 46px);
            line-height: 1.08;
        }
        p {
            margin: 16px 0 0;
            color: #62656d;
            line-height: 1.7;
        }
    </style>
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript>
    <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-MMKLD7DN"
        height="0"
        width="0"
        style="display:none;visibility:hidden">
    </iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->
    <main class="success-card">
        <div class="success-mark" aria-hidden="true">✓</div>
        <h1>Заявка отправлена</h1>
        <p>Спасибо! Возвращаем вас на сайт — скоро свяжемся с вами.</p>
    </main>
    <script>
        (function() {
            var redirectUrl = <?php echo $redirect_json; ?>;
            var redirected = false;

            function redirectToSite() {
                if (redirected) return;
                redirected = true;
                window.location.replace(redirectUrl);
            }

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'generate_lead',
                lead_source: <?php echo $lead_source_json; ?>,
                form_name: <?php echo $form_name_json; ?>,
                page_path: <?php echo $page_path_json; ?>,
                selected_color: <?php echo $selected_color_json; ?>,
                selected_project: <?php echo $selected_project_json; ?>,
                form_location: <?php echo $form_location_json; ?>,
                offer_type: <?php echo $offer_type_json; ?>,
                offer_name: <?php echo $offer_name_json; ?>,
                offer_value: <?php echo $offer_value_json; ?>,
                available_offer_types: <?php echo $available_offer_types_json; ?>,
                offer_page: <?php echo $offer_page_json; ?>,
                offer_location: <?php echo $offer_location_json; ?>,
                event_date: <?php echo $event_date_json; ?>,
                requested_services: <?php echo $requested_services_json; ?>,
                early_booking_eligible: <?php echo $early_booking_eligible_json; ?>,
                eventCallback: redirectToSite,
                eventTimeout: 1500
            });

            console.info('dataLayer generate_lead');
            window.setTimeout(redirectToSite, 1800);
        })();
    </script>
</body>
</html>
    <?php
    exit;
}

$form_name = form_name_value();
$expects_json = expects_json_response();
$redirect_base = $form_name === 'payetki_booking_form'
    ? 'arenda-payetok-minsk/'
    : 'index.html';
$offer_context = build_offer_context();

$required_fields_missing = post_value('name') === '' || post_value('phone') === '';
$validation_message = 'Заполните обязательные поля формы.';

if (
    $form_name !== 'pdf_download_form'
    && $form_name !== 'payetki_booking_form'
    && post_value('eventType') === ''
) {
    $required_fields_missing = true;
}

if (
    $form_name === 'payetki_booking_form'
    && (post_value('date') === '' || post_value('selected_color') === '')
) {
    $required_fields_missing = true;
}

if (offer_requires_event_date($offer_context['offer_type'])) {
    if ($offer_context['event_date'] === '' || offer_event_date_is_past($offer_context['event_date'])) {
        $required_fields_missing = true;
        $validation_message = 'Укажите корректную дату мероприятия.';
    }
}

if ($required_fields_missing) {
    if ($expects_json) {
        send_json_response(false, array('message' => $validation_message), 422);
    }

    header('Location: ' . $redirect_base . '?sent=0');
    exit;
}

$lines = array();
$form_location = post_value('form_location');
$source = post_value('source');
add_line($lines, 'Источник', lead_source_label($form_location, $source));
add_line($lines, 'Детали источника', $source);
add_line($lines, 'Имя', post_value('name'));
add_line($lines, 'Телефон / Telegram', post_value('phone'));
add_line($lines, 'Услуга', post_value('product_type'));
add_line($lines, 'Цвет пайеток', post_value('selected_color'));
add_line($lines, 'Тип мероприятия', post_value('eventType'));
add_line($lines, 'Бюджет мероприятия', post_value('budget'));
add_line($lines, 'Дата мероприятия', $offer_context['event_date'] !== '' ? $offer_context['event_date'] : post_value('date'));
add_line($lines, 'Место проведения', post_value('place'));
add_line($lines, 'Комментарий', post_value('comment'));
add_line($lines, 'Предварительная стоимость', post_value('estimatedPrice'));
add_line($lines, 'Фотозона', post_value('selected_project'));
add_line($lines, 'ID проекта', post_value('project_id'));
add_line($lines, 'Изображение проекта', post_value('project_image'));
add_line($lines, 'Категория', post_value('project_category'));
add_line($lines, 'URL проекта', post_value('project_url'));
if ($offer_context['offer_type'] === 'special_offer_consultation') {
    $available_types = explode(',', $offer_context['available_offer_types']);
    $offer_page = $offer_context['offer_page'] !== ''
        ? $offer_context['offer_page']
        : post_value('page_path');
    add_line($lines, 'Запрос', 'Подобрать специальное предложение');
    add_line($lines, 'Выбор клиента', 'Клиент не выбирал конкретную акцию');
    add_line($lines, 'До мероприятия', $offer_context['days_until_event'] . ' дней');
    add_line(
        $lines,
        'Раннее бронирование 30+ дней',
        $offer_context['early_booking_eligible'] === 'yes' ? 'да' : 'нет'
    );
    add_line(
        $lines,
        'Что планируется оформить',
        $offer_context['requested_services'] !== '' ? $offer_context['requested_services'] : 'Не указано'
    );
    add_line($lines, 'Страница заявки', $offer_page);
    add_line($lines, 'Место формы', $form_location);
    $lines[] = '<b>Доступные для проверки механики:</b>';
    if (in_array('early_booking_gift', $available_types, true)) {
        $lines[] = '— декор до 100 BYN при бронировании минимум за 30 дней;';
    }
    if (in_array('bundle_discount', $available_types, true)) {
        $lines[] = '— скидка 10% на дополнительную зону при комплексном заказе;';
    }
    if (in_array('available_date_offer', $available_types, true)) {
        $lines[] = '— специальные условия на отдельную свободную дату.';
    }
    if (
        $offer_context['early_booking_eligible'] === 'yes'
        && in_array('early_booking_gift', $available_types, true)
    ) {
        $lines[] = 'Возможно применить подарок за раннее бронирование — требуется проверить состав заказа и доступный декор.';
    } elseif ($offer_context['early_booking_eligible'] !== 'yes') {
        $lines[] = 'Условие 30 дней не выполнено — проверить комплексное предложение или условия на свободную дату.';
    }
    if (
        $offer_context['requested_services'] === 'Фотозона и дополнительная зона'
        && in_array('bundle_discount', $available_types, true)
    ) {
        $lines[] = 'Возможно применить скидку 10% на дополнительную зону — требуется расчёт менеджера.';
    }
} else {
    add_line($lines, 'Место формы', $form_location);
    add_line($lines, 'Предложение', $offer_context['offer_name']);
    add_line($lines, 'Тип предложения', $offer_context['offer_type']);
    add_line($lines, 'Ценность', $offer_context['offer_value']);
    add_line($lines, 'Страница предложения', $offer_context['offer_page']);
    add_line($lines, 'Место предложения', $offer_context['offer_location']);
    if ($offer_context['offer_type'] === 'bundle_discount') {
        add_line($lines, 'Условие скидки', 'Скидка 10% применяется к дополнительной зоне');
    }
    if ($offer_context['offer_type'] === 'available_date_offer') {
        add_line($lines, 'Статус запроса', 'Клиент просит проверить специальные условия на указанную дату');
    }
    if ($offer_context['offer_type'] === 'early_booking_gift') {
        add_line(
            $lines,
            'Условие раннего бронирования',
            $offer_context['early_booking_eligible'] === 'yes'
                ? 'Дата подходит под условие 30+ дней; итоговый подарок согласуется после уточнения состава заказа'
                : 'До мероприятия меньше 30 дней; проверить доступные варианты и возможные специальные условия'
        );
    }
}
add_line($lines, 'Квиз: тип мероприятия', post_value('quiz-type'));
add_line($lines, 'Квиз: площадь', post_value('quiz-area'));
add_line($lines, 'Квиз: стиль', post_value('quiz-style'));
add_line($lines, 'Квиз: срочность', post_value('quiz-urgency'));
add_line($lines, 'Согласие', post_value('consent'));
add_line($lines, 'Страница', post_value('page_path'));

if (empty($lines) || !$token || !$chat_id) {
    if ($expects_json) {
        send_json_response(false, array('message' => 'Сервис отправки заявок временно недоступен.'), 500);
    }

    header('Location: ' . $redirect_base . '?sent=0');
    exit;
}

$text = "Новая заявка с сайта LAVDRAGON\n\n" . implode("\n", $lines);
$url = "https://api.telegram.org/bot{$token}/sendMessage";
$payload = array(
    'chat_id' => $chat_id,
    'parse_mode' => 'HTML',
    'text' => $text,
);

$success = false;

if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $success = $response !== false && $http_code >= 200 && $http_code < 300;
} else {
    $context = stream_context_create(array(
        'http' => array(
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query($payload),
            'timeout' => 20,
        ),
    ));

    $response = file_get_contents($url, false, $context);
    $success = $response !== false;
}

$is_pdf_catalog = post_value('source') === 'PDF Каталог трендов 2026';
$redirect_url = $redirect_base . '?sent=' . ($success ? '1' : '0')
    . ($is_pdf_catalog ? '&pdf_catalog=1' : '')
    . '&form_name=' . rawurlencode($form_name);

if ($expects_json) {
    send_json_response(
        $success,
        array(
            'form_name' => $form_name,
            'pdf_catalog' => $is_pdf_catalog,
            'offer_context' => $offer_context,
            'message' => $success
                ? 'Заявка успешно отправлена.'
                : 'Не удалось отправить заявку. Попробуйте ещё раз.',
        ),
        $success ? 200 : 502
    );
}

if ($success) {
    render_success_redirect(
        $redirect_url,
        $form_name,
        post_value('page_path') !== '' ? post_value('page_path') : source_page_path(),
        $form_name === 'payetki_booking_form' ? 'payetki_landing' : 'website_form',
        post_value('selected_color'),
        post_value('selected_project'),
        post_value('form_location'),
        $offer_context
    );
}

header('Location: ' . $redirect_url);
exit;

?>
