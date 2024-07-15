<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
require_once "file_class.php";

class filesystem
{

    public $basedir;
    public $masks = [];
    public $struct = [];
    public $level = 0;


    function __construct($basedir = "")
    {

        $this->basedir = $basedir == "" ? $_SERVER['DOCUMENT_ROOT'] . "/data" : $basedir;
    }



    function getstruct($root, $onlyfolders = false)
    {

        $this->level++;
        $files = array();


        foreach (glob($root . '/*') as $file) {






            if (is_dir($file)) {


                $filedata = new file();
                $filedata->name = basename($file);
                $filedata->baseroot = substr($file,strlen($this->basedir));
                $filedata->type = "dir";
                $filedata->level = $this->level;
                $this->struct[] = $filedata;


                $this->getstruct($file, $onlyfolders);
            } else {


                $filedata = new file();
                $filedata->name = basename($file);
                $filedata->baseroot =substr($file,strlen($this->basedir),strlen($file)-strlen($this->basedir)-strlen(basename($file)));
                $filedata->type = "file";
                $filedata->level = $this->level;

                if (strtolower(explode(".", $file)[count(explode(".", $file)) - 1]) == "json") $this->struct[] = $filedata;
            }
        }
        $this->level--;
    }


    function buildstruct($onlyfolders = false)
    {
        $this->struct = [];
        $this->getstruct($this->basedir, $onlyfolders);
        return $this->struct;
    }

    function openFile($path)
    {
        echo file_get_contents($this->basedir . "/" . $path);

    }
}
