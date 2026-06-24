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

if (post_value('source') === 'PDF Каталог трендов 2026') {
    header('Location: index.html?sent=' . ($success ? '1' : '0') . '&pdf_catalog=1');
    exit;
}

header('Location: index.html?sent=' . ($success ? '1' : '0'));
exit;

?>
