<?php
require_once 'vendor/autoload.php';

use VampiRUS\MxlReader\Mxl;

echo "converter";

$converter=new Mxl("Page.1.mxl");
//print_r( $converter-> getDataAsArray()) ;

print_r( $converter-> header );

print_r( $converter->getDataAsArray());
