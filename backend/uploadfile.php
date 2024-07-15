<?php
//ini_set('display_errors', '1');
//ini_set('display_startup_errors', '1');
//error_reporting(E_ALL);
require_once "mxltojson.class.php";

$path = "../data/" . $_GET["path"];

if (is_dir($_GET["path"]) === false) {
	mkdir($path, 7777);
}


$dt = file_get_contents('php://input',false,null,2);

$fn2 = "../data/" . $_GET["path"] . "/" . $_GET["file"] ;
file_put_contents($fn2, $dt);



$Converter=new mxltoJSON($fn2);


$Converter->convert();

