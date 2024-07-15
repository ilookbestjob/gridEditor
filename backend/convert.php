<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('memory_limit', '1500000000');

require_once "mxltojson.class.php";
 $convertlocal=false;

if(!isset($_GET["file"])){
echo "Имя файла не задано!!!";
$convertlocal=true;

}


if(!isset($_GET["path"])){
    echo "Не задан путь!!!";
    $convertlocal=true;
    
    }



if ($convertlocal)
{
    $Converter=new mxltoJSON("../data/ПроизводствоПаспорт/Макет1.mxl",isset($_GET["debug"]));
   // $Converter=new mxltoJSON("../data/Производство/Таблица.mxl",isset($_GET["debug"]));
}
else{
$Converter=new mxltoJSON("../data/" . $_GET["path"] . "/".$_GET["file"],isset($_GET["debug"]));
}


$Converter->convert();