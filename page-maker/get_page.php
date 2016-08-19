<?php

require_once('constants.php');

if (isset($_GET['name'])) {
    $name = $_GET['name'];
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_DATABASE);
        $query = $conn->prepare('SELECT `story` FROM `stories` WHERE `name` = ?');
        $query->bind_param('s', $name);
        $query->execute();
        $query->bind_result($result);
        $query->fetch();
        $query->close();
        if ($result) {
            http_response_code(200);
            exit(json_encode(array('result' => 'success',
                'story' => $result)));
        } else {
            http_response_code(400);
            exit(json_encode(array('result' => 'error',
                'message' => 'story not found')));
        }

    } catch (Exception $e) {
        http_response_code(500);
        exit(json_encode(array('result' => 'error',
            'message' => $e->getMessage())));
    }
} else {
    http_response_code(404);
}