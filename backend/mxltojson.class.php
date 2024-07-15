<?php
require_once "cellprops.class.php";
require_once "objprops.class.php";

class mxltoJSON
{
    public $header;

    protected $file;
    protected $handle;

    public $debug;


    public $fontnumbers = [];
    public $fonts = [];


    public $colnumbers = [];
    public $cols = [];

    public $rownumbers = [];
    public $rows = [];


    public $cellnumbers = [];
    public $cells = [];

    public $objs = [];


    public $pictures = [];

    public $oles = [];


    public $shift = -1;
    public $shifts = [];
    public $shiftstotal = [];


    private $celllimit;
    private $rowlimit;
    private $collimit;
    private  $savefile;

    public $localshift = -1;
    public $localshifts = [];
    public $localshiftstotal = [];

    public $objects = [];



    // public $props=[];

    function __construct($file = "", $debug = false)
    {
        $this->file = $file;
        $this->debug = $debug;
        if ($debug) {
            echo "Отладка mxltojson.php</br></br></br>";
            $this->celllimit = 500;
            $this->rowlimit = 500;
            $this->collimit = 500;
        }
    }

    function convert($file = "")
    {

        $file = $file == "" ? $this->file : $file;
        echo $file;


        $this->fontnumbers = [];
        $this->fonts = [];

        $this->colnumbers = [];
        $this->cols = [];

        $this->rownumbers = [];
        $this->rows = [];


        $this->cellnumbers = [];
        $this->cells = [];

        $this->pictures = [];

        $this->oles = [];


        $this->props = [];


        $this->shift = -1;
        $this->shifts = [];
        $this->shiftstotal = [];

        $this->handle = fopen($file, "rb");
        //$this->shifts["start"]=[];
        //$this->shiftstotal["start"]=0;
        //  $this->readShort();
        $this->getheader();
        $this->getTable();
        $this->getFonts();
        $this->getColontitles();
        $this->getCols();
        $this->getRows();
        $this->getObjects();
        $this->savefile = explode(".", $file);
        unset($this->savefile[count($this->savefile) - 1]);
        echo $this->savefile = implode(".", $this->savefile) . ".json";
        file_put_contents($this->savefile, '{"error":"Произошла ошибка в формировании файла"}');
        file_put_contents($this->savefile, json_encode($this));
        fclose($this->handle);

        // print_r($this);
    }


    function getheader()
    {
        $this->shifts["header"] = [];
        $this->shiftstotal["header"] = 0;
        $this->header = $this->readString(25);



        //  $this->alert($this->header, 1, "Заголовок");
    }

    function getTable()
    {
        $this->shifts["table"] = [];
        $this->shiftstotal["table"] = 0;
        $contents = $this->readBytesAsArray(30);


        //   $this->alert($contents, 3, "Таблица");
    }

    function getFonts()
    {
        $this->shifts["fonts"] = [];
        $this->shiftstotal["fonts"] = 0;
        $numbers = $this->readShort();


        //$this->alert($numbers, 1, "Количество номеров шрифтов");

        if ($numbers != 0) {
            for ($t = 1; $t <= $numbers; $t++) {
                $this->fontnumbers[] = $this->readLong();

                //$this->alert($numbers, 1, "");
            }
        }

        // $this->alert($this->fontnumbers, 3, "Номера шрифтов");

        $fonts = $this->readShort();


        // $this->alert($fonts, 1, "Количество шрифтов ");

        if ($fonts != 0) {
            for ($t = 1; $t <= $fonts; $t++) {
                $this->fonts[] = $this->readBytesAsArray(60);
            }
        }


        //  $this->alert($this->fonts, 3, "Шрифты");
        $temp = $this->readLong();
        //  $this->alert($temp, 1, "HZ");
    }

    function getColontitles()
    {
        $this->shifts["colontitles"] = [];
        $this->shiftstotal["colontitles"] = 0;
        $this->readBytesAsArray(60);

        // $this->alert("", 1, "Колонтитулы");
    }



    function getCols()
    {
        $this->shifts["cols"] = [];
        $this->shiftstotal["cols"] = 0;
        $numbers = $this->readShort();

        //   $this->alert($numbers, 1, "Количество номеров колонок");


        for ($t = 1; $t <= $numbers; $t++) {
            $this->colnumbers[] = $this->readLong();
        }


        //  $this->alert($this->colnumbers, 3, "Номера колонок");

        $cols = $this->readShort();


        if ($this->debug && $this->collimit < $cols) {

            echo "Превышен лимит колонок.Ошибка чтения файла!!";
            exit(0);
        }


        //$this->alert($cols, 1, "Количество колонок");
        for ($t = 1; $t <= $cols; $t++) {
            //$this->cols[$this->colnumbers[$t-1]] = [$this->getCell()];
            $this->cols += [$this->colnumbers[$t - 1] => $this->getCell()];
        }



        //$this->alert($this->cols, 4, "Колонки");
    }


    function getRows()
    {

        $this->shifts["rows"] = [];
        $this->shiftstotal["rows"] = 0;

        $numbers = $this->readShort();

        //$this->alert($numbers, 1, "Количестово номеров рядов");


        for ($t = 1; $t <= $numbers; $t++) {
            $this->rownumbers[] = $this->readLong();
        }


        //  $this->alert($this->rownumbers, 3, "Номера радов");

        $rows = $this->readShort();

        if ($this->debug && $this->rowlimit < $rows) {

            echo "Превышен лимит рядов.Ошибка чтения файла!!";
            exit(0);
        }


        //  $this->alert($rows, 1, "Количество рядов");
        for ($t = 1; $t <= $rows; $t++) {
            //$this->rows[] = $this->readBytesAsArray(30);
            // echo "<br><br>Ряд " . $t . "<br><br>";


            $this->rows[$this->rownumbers[$t - 1]] = $this->getCell();
            //  $this->buildcellprops($this->rows[$this->rownumbers[$t - 1]]);
            //  echo "<br><br>Ячейка по умолчанию. Смещение:" . $this->shift . "<br><br>";

            //echo "<br><br>Ячейки ряда<br><br>";
            $this->getCells($this->rownumbers[$t - 1]);
        }



        //  $this->alert($this->rows, 4, "Ряды");

        //  print_r($this->rows);
    }


    function getCells($row = -1)
    {


        $numbers = $this->readShort();

        //  $this->alert($numbers, 1, "Количество номеров ячеек");


        for ($t = 1; $t <= $numbers; $t++) {
            //if ($row == -1) {
            //  $this->cellnumbers[] = $this->readLong();
            //}
            //else
            {

                $this->cellnumbers[$row][] = $this->readLong();
            }
        }


        //$this->alert($this->cellnumbers, 4, "Номера ячеек");

        $cells = $this->readShort();

        if ($this->debug && $this->celllimit < $cells) {

            echo "Превышен лимит ячеек.Ошибка чтения файла!!";
            exit(0);
        }



        //  $this->alert($cells, 1, "Количество ячеек");
        for ($t = 1; $t <= $cells; $t++) {
            $this->cells[$row][$this->cellnumbers[$row][$t - 1]] = $this->getCell();

            //  $this->buildcellprops($this->cells[$row][$this->cellnumbers[$row][$t - 1]]);
        }



        //  $this->alert($this->cells, 4, "ячейки");
    }



    private function getCell()
    {
        $props = new cellprops();

        $data = '';

        $this->localshift = 0;
        $this->localshifts = [];
        $this->localshiftstotal = [];
        $cell_info = $this->readBytesAsArray(4);



        $bin = decbin($cell_info[1]);
        $flags = substr("00000000", 0, 8 - strlen($bin)) . $bin;

        $props->flag1 = $flags;
        $props->fontName_flag = $flags[7] == "0" ? "false" : "true";
        $props->fontSize_flag = $flags[6] == "0" ? "false" : "true";;
        $props->fontBold_flag = $flags[5] == "0" ? "false" : "true";;
        $props->fontItalic_flag = $flags[4] == "0" ? "false" : "true";;
        $props->fontUnderline_flag = $flags[3] == "0" ? "false" : "true";;


        $props->frameLeft_flag = $flags[2] == "0" ? "false" : "true";;
        $props->frameTop_flag = $flags[1] == "0" ? "false" : "true";;
        $props->frameRight_flag = $flags[0] == "0" ? "false" : "true";;

        $bin = decbin($cell_info[2]);
        $flags = substr("00000000", 0, 8 - strlen($bin)) . $bin;


        $props->flag2 = $flags;
        $props->frameBottom_flag = $flags[7] == "0" ? "false" : "true";;

        $props->borderColor_flag = $flags[5] == "0" ? "false" : "true";;
        $props->main1_flag = $flags[5] == "0" ? "false" : "true";;
        $props->main2_flag = $flags[4] == "0" ? "false" : "true";;

        $props->horizontal_flag = $flags[3] == "0" ? "false" : "true";;
        $props->vertical_flag = $flags[2] == "0" ? "false" : "true";;


        $props->fontColor_flag = $flags[1] == "0" ? "false" : "true";;
        $props->bgColor_flag = $flags[0] == "0" ? "false" : "true";;

        $bin = decbin($cell_info[3]);
        $flags = substr("00000000", 0, 8 - strlen($bin)) . $bin;
        $props->flag3 = $flags;
        $props->pattern_flag = $flags[7] == "0" ? "false" : "true";;
        $props->patternColor_flag = $flags[6] == "0" ? "false" : "true";;;


        $props->control_flag = $flags[5] == "0" ? "false" : "true";;;

        $props->type_flag = $flags[4] == "0" ? "false" : "true";;;


        $props->protect_flag = $flags[3] == "0" ? "false" : "true";;;

        $bin = decbin($cell_info[4]);
        $flags = substr("00000000", 0, 8 - strlen($bin)) . $bin;
        $props->flag4 = $flags;
        $props->description_flag = $flags[6] == "0" ? "false" : "true";
        $props->text_flag = $flags[7] == "0" ? "false" : "true";






        $props->main1_value = $this->readShort();
        $props->main2_value = $this->readShort();


        $props->fontnumber_value == $this->readShort();
        $props->fontsize_value = $this->readShortSign();
        $props->fontbold_value = $this->readShort();
        $props->fontitalic_value = $this->readByte();
        $props->fontunderline_value = $this->readByte();


        $props->Align_value = $this->readByteSign();
        $props->vAlign_value = $this->readByte();

        $props->pattern_value = $this->readByte();

        $props->borderLeft_value = $this->readByte();
        $props->borderTop_value = $this->readByte();
        $props->borderRight_value = $this->readByte();
        $props->borderBottom_value = $this->readByte();

        $props->patterncolor_value = $this->readByte();
        $props->bordercolor_value = $this->readByte();
        $props->fontcolor_value = $this->readByte();
        $props->bgcolor_value = $this->readByte();

        $props->controlType_value = $this->readByte();
        $props->DataType_value = $this->readByte();

        $this->readByte();



        // $cell_info = $this->readBytesAsArray(30);
        // print_r($cell_info);




        if ($cell_info[4] == 0x80 || $cell_info[4] == 0xC0) {

            $length = $this->readByte();
            //          echo "Длина текста:" . $length . " Смещение:" . $this->shift . "<br><br>";
            if ($length == 255) {
                $length = $this->readShort();
            }
            $props->Text = $this->readString($length);

            //            echo "<br>Смещение(конец):" . $this->shift . "<br><br>";
        }


        if ($cell_info[4] == 0x40 || $cell_info[4] == 0xC0) {
            $length = $this->readByte();
            if ($length == 255) {
                $length = $this->readShort();
            }
            echo "Длина описания:" . $length . " Смещение(начало):" . $this->shift . "<br><br>";
            echo    $this->Description = $this->readString($length);
            echo "<br>Смещение(конец):" . $this->shift . "<br><br>";
        }
        //return  mb_convert_encoding($data, "utf8", "Windows-1251");
        //$this->alert($props, 3, "Свойства ячейки");



        return  $props;
    }

    private function getObjects()
    {
        $ctr = 0;
        echo "<br><br>Рисунки<br><br><br>";
        echo "<br><br>смещение $this->shift";
        $objs = $this->readShort();
        echo "<br><br>Начало рисунка $this->shift<br>";
        echo "Количество объектов:" . $objs . "<br><br>";
        for ($t = 1; $t <= $objs; $t++) {
            $this->objs[] = $this->getCell();
            $this->buildcellprops($this->objs[count($this->objs) - 1]);
            $pictureType = $this->readLong();
            echo "Тип Рисунка:" . $pictureType;


            $temp = new objprops();
            $temp->type = $pictureType;
            $temp->startcol = $this->readLong();
            $temp->startrow = $this->readLong();

            $temp->shiftStartX = $this->readLong();
            $temp->shiftStartY = $this->readLong();

            $temp->endtcol = $this->readLong();
            $temp->endrow = $this->readLong();
            $temp->shiftEndX = $this->readLong();
            $temp->shiftEndY = $this->readLong();
            $temp->level = $this->readLong();



            if ($pictureType == 5) {
                $ctr++;
                echo "Рисунок $ctr<br><br>";

                echo "Спецсимволы:" . $this->readString(4);
                echo $picturesize = $this->readLong();
                $path = explode("/", $this->file);

                $file = $path[count($path) - 1];

                $file = explode(".", $file);
                $file = $file[0];

                unset($path[count($path) - 1]);
                $path = implode("/", $path);


                echo "Путь к файлу:$path<br>";
                echo "Файл:$file<br>";

                echo $newpathfile = $path . "/" . $file . "_img$ctr.bmp";
                echo "<br><br><br>";
                echo $temp->file =$file . "_img$ctr.bmp";
                $this->savefile($picturesize, $newpathfile);
                
            }
            $this->objects[] = $temp;
        }
    }

    function alert($data, $type, $text = "")
    {
        if ($this->debug) {
            switch ($type) {
                case 1:
                    echo "</br></br>$text: ";
                    echo $data;
                    echo "</br>shift:" . $this->shift . "</br></br>";
                    break;
                case 2:
                    print_r($data);
                    echo "</br>shift:" . $this->shift . "</br></br>";
                    break;

                case 3:
                    echo "</br></br>$text</br></br>";
                    foreach ($data as $key => $item) {
                        echo $key . "=" . $item . "</br>";
                    };
                    echo "shift:" . $this->shift . "</br></br>";
                    break;

                case 4:
                    echo "</br></br>$text</br></br>";
                    foreach ($data as $key => $item) {
                        echo  "Элемент $key </br>";

                        foreach ($item as $key2 => $item2) {
                            echo $key2 . "=" . $item2 . "</br>";
                        }
                    };
                    echo "shift:" . $this->shift . "</br></br>";
                    break;
            }
        }
    }

    function buildcellprops($props)
    {

        $data = json_decode(json_encode($props), true);

        echo '<table style="margin-top:60px;"><tr><td>Смещение</td></tr>';
        foreach ($this->localshifts as $key => $localshift) {
            echo "<tr>";
            echo "<td>" . $localshift . "(" . $this->localshiftstotal[$key] . ")</td>";
            echo "</td></tr>";
        }
        echo "</table>";
        echo '<table style="margin-top:60px;"><tr><td>Свойство</td><td>Значение</td></tr>';

        foreach ($data as $key => $dataitem) {
            echo "<tr><td>$key</td><td>";

            print_r($dataitem);
            echo "</td></tr>";
        }




        echo "</table>";
    }







    private function readByte()
    {
        if (feof($this->handle)) {
            echo "Достигнут конец файла";
            $file = $this->savefile;
            unset($this->savefile);
            file_put_contents($this->savefile, json_encode($this));
            fclose($this->handle);
            exit;
        }
        $data = fread($this->handle, 1);
        $byte = unpack("C", $data);
        $this->shift = $this->shift + 1;
        $this->shifts[array_keys($this->shifts)[count($this->shifts) - 1]][] = 1;
        $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] = $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] + 1;
        //echo "[Сдвиг: ".($this->localshift++)."]     ";

        $this->localshifts[] = 1;
        $this->localshiftstotal[] = (count($this->localshiftstotal) - 1) >= 0 ? $this->localshiftstotal[count($this->localshiftstotal) - 1] + 1 : 1;
        return $byte[1];
    }

    private function readByteSign()
    {
        if (feof($this->handle)) {
            echo "Достигнут конец файла";
            $file = $this->savefile;
            unset($this->savefile);
            file_put_contents($this->savefile, json_encode($this));
            fclose($this->handle);
            exit;
        }
        $data = fread($this->handle, 1);
        $byte = unpack("c", $data);
        $this->shift = $this->shift + 1;
        $this->shifts[array_keys($this->shifts)[count($this->shifts) - 1]][] = 1;
        $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] = $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] + 1;
        //echo "[Сдвиг: ".($this->localshift++)."]     ";
        $this->localshiftstotal[] = (count($this->localshiftstotal) - 1) >= 0 ? $this->localshiftstotal[count($this->localshiftstotal) - 1] + 1 : 1;
        $this->localshifts[] = 1;
        return $byte[1];
    }


    private function savefile($size, $newfile)
    {



        $handle = fopen($newfile, "wb");
        $data = fread($this->handle, $size);
        fwrite($handle, $data);
        fclose($handle);
    }

    private function readBytesAsArray($count)
    {
        if (feof($this->handle)) {
            echo "Достигнут конец файла";
            $file = $this->savefile;
            unset($this->savefile);
            file_put_contents($this->savefile, json_encode($this));
            fclose($this->handle);
            exit;
        }
        $data = fread($this->handle, $count);
        $array = unpack("C*", $data);
        // $array = unpack("H", $data);
        $this->shift = $this->shift + $count;
        $this->shifts[array_keys($this->shifts)[count($this->shifts) - 1]][] = $count;
        $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] = $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] + $count;

        $this->localshift = $this->localshift + $count;
        $this->localshifts[] = $count;
        $this->localshiftstotal[] = (count($this->localshiftstotal) - 1) >= 0 ? $this->localshiftstotal[count($this->localshiftstotal) - 1] + $count : $count;
        //echo "[Сдвиг: ".($this->localshift)."]     ";

        return $array;
    }

    private function readShort()
    {
        if (feof($this->handle)) {
            echo "Достигнут конец файла";
            $file = $this->savefile;
            unset($this->savefile);
            file_put_contents($this->savefile, json_encode($this));
            fclose($this->handle);
            exit;
        }
        $this->shift = $this->shift + 2;

        $data = fread($this->handle, 2);

        /*echo "7777777</br>";
        $short2 = unpack("S", $data);
        print_r($short2);
        echo "readShort()</br>";
*/
        $short = unpack("S", $data);

        $this->shifts[array_keys($this->shifts)[count($this->shifts) - 1]][] = 2;
        $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] = $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] + 2;

        $this->localshift = $this->localshift + 2;
        $this->localshifts[] = 2;
        $this->localshiftstotal[] = (count($this->localshiftstotal) - 1) >= 0 ? $this->localshiftstotal[count($this->localshiftstotal) - 1] + 2 : 2;
        //echo "[Сдвиг: ".($this->localshift)."]     ";
        return $short[1];
    }


    private function readShortSign()
    {
        if (feof($this->handle)) {
            echo "Достигнут конец файла";
            $file = $this->savefile;
            unset($this->savefile);
            file_put_contents($this->savefile, json_encode($this));
            fclose($this->handle);
            exit;
        }
        $this->shift = $this->shift + 2;

        $data = fread($this->handle, 2);

        /*echo "7777777</br>";
        $short2 = unpack("S", $data);
        print_r($short2);
        echo "readShort()</br>";
*/
        $short = unpack("s", $data);

        $this->shifts[array_keys($this->shifts)[count($this->shifts) - 1]][] = 2;
        $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] = $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] + 2;

        $this->localshift = $this->localshift + 2;
        $this->localshifts[] = 2;
        $this->localshiftstotal[] = (count($this->localshiftstotal) - 1) >= 0 ? $this->localshiftstotal[count($this->localshiftstotal) - 1] + 2 : 2;
        //echo "[Сдвиг: ".($this->localshift)."]     ";
        return $short[1];
    }

    private function readLong()
    {
        if (feof($this->handle)) {
            echo "Достигнут конец файла";
            $file = $this->savefile;
            unset($this->savefile);
            file_put_contents($this->savefile, json_encode($this));
            fclose($this->handle);
            exit;
        }
        $this->shift = $this->shift + 4;
        $data = fread($this->handle, 4);
        $long = unpack("L", $data);
        $this->shifts[array_keys($this->shifts)[count($this->shifts) - 1]][] = 4;
        $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] = $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] + 4;

        $this->localshift = $this->localshift + 4;
        $this->localshifts[] = 4;
        $this->localshiftstotal[] = (count($this->localshiftstotal) - 1) >= 0 ? $this->localshiftstotal[count($this->localshiftstotal) - 1] + 4 : 4;
        //echo "[Сдвиг: ".($this->localshift)."]     ";
        return $long[1];
    }

    private function readLongLong()
    {
        if (feof($this->handle)) {
            echo "Достигнут конец файла";
            $file = $this->savefile;
            unset($this->savefile);
            file_put_contents($this->savefile, json_encode($this));
            fclose($this->handle);
            exit;
        }
        $this->shift = $this->shift + 8;
        $data = fread($this->handle, 8);
        $long = unpack("Q", $data);
        $this->shifts[array_keys($this->shifts)[count($this->shifts) - 1]][] = 8;
        $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] = $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] + 8;

        $this->localshift = $this->localshift + 8;
        $this->localshifts[] = 8;
        $this->localshiftstotal[] = (count($this->localshiftstotal) - 1) >= 0 ? $this->localshiftstotal[count($this->localshiftstotal) - 1] + 8 : 8;
        //echo "[Сдвиг: ".($this->localshift)."]     ";
        return $long[1];
    }

    private function readString($length)
    {
        if (feof($this->handle)) {
            echo "Достигнут конец файла";
            $file = $this->savefile;
            unset($this->savefile);
            file_put_contents($this->savefile, json_encode($this));
            fclose($this->handle);

            exit;
        }
        $this->shift = $this->shift + $length;

        $data = fread($this->handle, $length);
        $string = unpack("a*", $data);

        $this->shifts[array_keys($this->shifts)[count($this->shifts) - 1]][] = $length;
        $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] = $this->shiftstotal[array_keys($this->shiftstotal)[count($this->shiftstotal) - 1]] + $length;

        $this->localshift = $this->localshift + $length;
        //echo "[Сдвиг: ".($this->localshift)."]     ";
        $this->localshifts[] = $length;
        $this->localshiftstotal[] = (count($this->localshiftstotal) - 1) >= 0 ? $this->localshiftstotal[count($this->localshiftstotal) - 1] + $length : $length;
        return mb_convert_encoding($string[1], 'UTF-8', "Windows-1251");
    }
}
