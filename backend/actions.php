<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
header('Access-Control-Allow-Origin:*');

//////////////////////////////////////

if (!isset($_GET["action"])) {
    echo "Не задано действие";
    exit;
}

$required = ["openfile" => ["path"]];

if (isset($required[$_GET["action"]])) {
    foreach ($required[$_GET["action"]] as $param) {

        if (!isset($_GET[$param])) {

            echo "Не обнаружен требуемый параметр в GET-запросе: $param";
            exit;
        }
    }
}


/////////////////////////////////////


switch ($_GET["action"]) {
    case "getfiles":
        require_once "filesystem_class.php";
        $files = new filesystem();
        echo json_encode($files->buildstruct());
        break;

    case "openfile":
        require_once "filesystem_class.php";
        $files = new filesystem();
        echo $files->openFile($_GET["path"]);
        break;
}
