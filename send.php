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
    );
    $value = post_value('form_name');

    return in_array($value, $allowed, true) ? $value : 'website_form';
}

function source_page_path() {
    $referrer = isset($_SERVER['HTTP_REFERER']) ? (string) $_SERVER['HTTP_REFERER'] : '';
    $path = $referrer !== '' ? parse_url($referrer, PHP_URL_PATH) : '/';

    return is_string($path) && $path !== '' ? $path : '/';
}

function render_success_redirect($redirect_url, $form_name, $page_path) {
    $redirect_json = json_encode($redirect_url, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $form_name_json = json_encode($form_name ?: 'website_form', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $page_path_json = json_encode($page_path ?: '/', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    ?>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex,nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Заявка отправлена</title>
    <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });
        (function(w, d, s, l, i) {
            var firstScript = d.getElementsByTagName(s)[0];
            var gtmScript = d.createElement(s);
            var dataLayerParam = l !== 'dataLayer' ? '&l=' + l : '';
            gtmScript.async = true;
            gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dataLayerParam;
            firstScript.parentNode.insertBefore(gtmScript, firstScript);
        })(window, document, 'script', 'dataLayer', 'GTM-MMKLD7DN');
    </script>
</head>
<body>
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
                lead_source: 'website_form',
                form_name: <?php echo $form_name_json; ?>,
                page_path: <?php echo $page_path_json; ?>,
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

$required_fields_missing = post_value('name') === '' || post_value('phone') === '';

if (
    $form_name !== 'pdf_download_form'
    && (post_value('eventType') === '' || post_value('budget') === '')
) {
    $required_fields_missing = true;
}

if ($required_fields_missing) {
    header('Location: index.html?sent=0');
    exit;
}

$lines = array();
add_line($lines, 'Источник', post_value('source'));
add_line($lines, 'Имя', post_value('name'));
add_line($lines, 'Телефон / Telegram', post_value('phone'));
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

if (empty($lines) || !$token || !$chat_id) {
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
$redirect_url = 'index.html?sent=' . ($success ? '1' : '0')
    . ($is_pdf_catalog ? '&pdf_catalog=1' : '')
    . '&form_name=' . rawurlencode($form_name);

if ($success) {
    render_success_redirect($redirect_url, $form_name, source_page_path());
}

header('Location: ' . $redirect_url);
exit;

?>
