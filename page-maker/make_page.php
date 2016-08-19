<?php

require_once('constants.php');

$name_used = true;


header('Content-Type: /json');

if (isset($_POST['story'])) {
    $story = strip_tags($_POST['story'], "<span>");

    $fname = get_name();

    if (save_story($fname, $story)) {
        # Send Page Name
        http_response_code(200);
        exit(json_encode(array('result' => 'success',
            'page_name' => $fname,
            'text' => $story)));

    } else {
        http_response_code(400);
        exit(json_encode(array('result' => 'error',
            'message' => 'Error adding story to database.')));
    }
} else {
    http_response_code(400);
    exit(json_encode(array(
            'result' => 'error',
            'message' => var_export($_REQUEST, true)
        )
    ));
}



function get_name()
{
    $result = uniqid(); # safe default in case of error finding name
    $used = True;
    $tries = 0;
    while ($used and $tries < 50000) {
        $adjs = json_decode(file_get_contents('adjectives.json'));
        $animals = json_decode(file_get_contents('animals.json'));
        $result = $adjs[array_rand($adjs)] . ucfirst($adjs[array_rand($adjs)]) . $animals[array_rand($animals)];
        $result = str_replace(" ", "", $result);
        $used = name_used($result);
        $tries++;
    }

    return $result;
}

function name_used($name)
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_DATABASE);
    $query = $conn->prepare("SELECT `name` FROM `stories` WHERE `name` = ?");
    $query->bind_param("s", $name);
    $query->execute();
    $query->bind_result($result);
    $query->fetch();
    $query->close();
    return !empty($result);
}

function save_story($name, $story)
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_DATABASE);
    $query = $conn->prepare("INSERT INTO stories (name, story) VALUES (?, ?)");
    $query->bind_param("ss", $name, $story);
    $result = $query->execute();
    $query->close();
    return $result;
}

function sanitize($html)
{
    $dom = new DOMDocument();
    $dom->loadHTML($html);
    $script = $dom->getElementsByTagName('script');
    $remove = [];
    foreach ($script as $item) {
        $remove[] = $item;
    }

    foreach ($remove as $item) {
        $item->parentNode->removeChild($item);
    }

    $html = $dom->saveHTML();
    return $html;
}