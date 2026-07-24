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

function render_success_redirect($redirect_url, $form_name, $page_path, $lead_source = 'website_form', $selected_color = '') {
    $redirect_json = json_encode($redirect_url, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $form_name_json = json_encode($form_name ?: 'website_form', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $page_path_json = json_encode($page_path ?: '/', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $lead_source_json = json_encode($lead_source ?: 'website_form', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $selected_color_json = json_encode($selected_color, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

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
    <p>Заявка успешно отправлена. Возвращаем вас на сайт…</p>
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

$required_fields_missing = post_value('name') === '' || post_value('phone') === '';

if (
    $form_name !== 'pdf_download_form'
    && $form_name !== 'payetki_booking_form'
    && (post_value('eventType') === '' || post_value('budget') === '')
) {
    $required_fields_missing = true;
}

if (
    $form_name === 'payetki_booking_form'
    && (post_value('date') === '' || post_value('selected_color') === '')
) {
    $required_fields_missing = true;
}

if ($required_fields_missing) {
    if ($expects_json) {
        send_json_response(false, array('message' => 'Заполните обязательные поля формы.'), 422);
    }

    header('Location: index.html?sent=0');
    exit;
}

$lines = array();
add_line($lines, 'Источник', post_value('source'));
add_line($lines, 'Имя', post_value('name'));
add_line($lines, 'Телефон / Telegram', post_value('phone'));
add_line($lines, 'Услуга', post_value('product_type'));
add_line($lines, 'Цвет пайеток', post_value('selected_color'));
add_line($lines, 'Тип мероприятия', post_value('eventType'));
add_line($lines, 'Бюджет мероприятия', post_value('budget'));
add_line($lines, 'Дата', post_value('date'));
add_line($lines, 'Комментарий', post_value('comment'));
add_line($lines, 'Предварительная стоимость', post_value('estimatedPrice'));
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

    header('Location: index.html?sent=0');
    exit;
}

$text = "Новая заявка с сайта LADRAGON\n\n" . implode("\n", $lines);
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
$redirect_base = $form_name === 'payetki_booking_form'
    ? 'arenda-payetok-minsk/'
    : 'index.html';
$redirect_url = $redirect_base . '?sent=' . ($success ? '1' : '0')
    . ($is_pdf_catalog ? '&pdf_catalog=1' : '')
    . '&form_name=' . rawurlencode($form_name);

if ($expects_json) {
    send_json_response(
        $success,
        array(
            'form_name' => $form_name,
            'pdf_catalog' => $is_pdf_catalog,
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
        source_page_path(),
        $form_name === 'payetki_booking_form' ? 'payetki_landing' : 'website_form',
        post_value('selected_color')
    );
}

header('Location: ' . $redirect_url);
exit;

?>
