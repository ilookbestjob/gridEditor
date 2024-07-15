
import panel from "./panel.js"
import tree from "./tree.js"
import print from "./print.js"
import filesystem from "./filesystem.js"


export default class gridEditor {

    currentletters = [63]
    cursor = { left: 0, top: 0 }
    selectedobject = []
    lpanel = null
    resizingRow = -1
    resizingCol = -1
    resizingColWidth = 0
    resizingRowHeight = 0
    mousedownPos = { x: -1, y: -1 }
    mouseAction = ""

    selection = []
    printer = null


    gridData = []
    target = null
    params = []


    settings = {
        lastfiles: "",

    }


    starting = true;




    buildGrid = async (target, params) => {


        this.target = target
        this.params = params
        let _gridData = this.gridData
        if (!params) return "Функция вызвана с пустыми параметрами"
        if (!params.colcount) return "Отсутвует обязательный параметр colcount"
        if (!params.rowcount) return "Отсутвует обязательный параметр rowcount"

        $(target).css({ "display": "grid", "grid-template-rows": "minmax(70px , auto) 1fr 50px", "grid-template-columns": "1fr", "height": "100vh", "overflow": "hidden" })
        $(target).html('<div class="panels"></div><div class="gridcontainer"><div class="topheader"></div><div class="leftheader"></div><div class="data"></div></div><div class="footer"></div>')


        $(target).find(".data").html("")
        $(target).find(".data").css({
            "display": "grid", "grid-template-columns": "repeat(" + (params.colcount * 1 + 1) + " ,50px)",
            //    "grid-template-rows": "repeat(" + (params.rowcount * 1 + 1) + " ,19px)"
        })
        let letter

        const fileobj = new filesystem();






        this.filecontent = new panel(null, {
            name: "filecontent",
            visible: true,
            caption: "Содержимое файла",
            height: 600

        })

        let filecontent = new tree(this.filecontent, [], {
            name: "test", groupimg: "filesystem/folder.png", itemimg: "filesystem/file.png", type: 1
        })


        let th = this;

        let settings = new Proxy(th.settings, { // (*)


            set(target, prop, val) { // для перехвата записи свойства

                target[prop] = val
                localStorage.setItem("grideditorSettings", JSON.stringify(target))

                console.log("thissettings", th.settings)

                return true;

            }
        });


        this.settings = localStorage.getItem("grideditorSettings") ? JSON.parse(localStorage.getItem("grideditorSettings")) : this.settings;
        this.starting = false;

        console.log("Настройки ", this.settings)
        if (this.settings.lastfiles) {
            if (this.settings.lastfiles != "") {

                this.file = await fileobj.openFile(this.settings.lastfiles)


                this.builddata(target, params, this.file)
                console.log("startfile", this.file)

                filecontent.maketree(this.filecontent, this.file, {
                    name: "test", groupimg: "filesystem/folder.png", itemimg: "filesystem/file.png", type: 3
                })

            }
            else {
                console.log("перерисовка1")
                this.builddata(target, params)
            }


        }
        else {
            console.log("перерисовка2")
            this.builddata(target, params)
        }


        // $(target).find(".panels").css({"display":"flex","align-items":"center"})
        $(target).find(".panels").css({ "padding-top": "30px" })
        $(target).addClass("unselectable")


        $(".panels").contextmenu(function (event) {

            event.preventDefault()
        })

        this.lpanel = new panel(".panels", {
            name: "align",
            visible: true,
            caption: "выравнивание",
            items: [


                {

                    name: "gleft",
                    type: "button",
                    caption: "",
                    picture: "left.png",
                    onclick: () => {

                        $(this.selectedobject).css({ "justify-content": "flex-start" })

                        let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                        cell.galign = "flex-start"

                        this.selection.forEach(element => {
                            $(element).css({ "justify-content": "flex-start" })
                            let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                            cell.galign = "flex-start"

                        })

                    }
                },
                {
                    name: "gcenter",
                    type: "button",
                    caption: "",
                    picture: "center.png",
                    onclick: () => {
                        $(eval("this.selectedobject")).css({ "justify-content": "center" })

                        let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                        cell.galign = "center"

                        this.selection.forEach(element => {
                            $(element).css({ "justify-content": "center" })
                            let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                            cell.galign = "center"
                        })

                    }
                }

                ,
                {
                    name: "gright",
                    type: "button",
                    caption: "",
                    picture: "right.png",
                    onclick: () => {
                        $(this.selectedobject).css({ "justify-content": "flex-end" })

                        let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                        cell.galign = "flex-end"

                        this.selection.forEach(element => {
                            $(element).css({ "justify-content": "flex-end" })
                            let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                            cell.galign = "flex-end"
                        })
                    }

                }
                ,
                {
                    name: "vtop",
                    type: "button",
                    caption: "",
                    picture: "top.png",
                    onclick: () => {
                        $(this.selectedobject).css({ "align-items": "flex-start" })
                        let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                        cell.valign = "flex-start"

                        this.selection.forEach(element => {
                            $(element).css({ "align-items": "flex-start" })
                            let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                            cell = { ...cell, valign: "flex-start" }
                        })
                    }
                }
                ,
                {
                    name: "vcenter",
                    type: "button",
                    caption: "",
                    picture: "center.png",
                    onclick: () => {
                        $(this.selectedobject).css({ "align-items": "center" })
                        let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                        cell.valign = "center"

                        this.selection.forEach(element => {
                            $(element).css({ "align-items": "center" })
                            let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                            cell = { ...cell, valign: "center" }
                        })
                    }
                },
                {
                    name: "vbottom",
                    type: "button",
                    caption: "",
                    picture: "bottom.png",
                    onclick: () => {
                        $(this.selectedobject).css({ "align-items": "flex-end" })

                        let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                        cell.galign = "flex-end"

                        this.selection.forEach(element => {
                            $(element).css({ "align-items": "flex-end" })
                            let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                            cell = { ...cell, valign: "flex-end" }
                        })
                    }
                }
            ]
        })






        this.lpanel = new panel(".panels", {
            name: "border",
            visible: true,
            caption: "Границы",
            items: [



                {
                    name: "top",
                    type: "button",
                    caption: "",
                    picture: "top.png",
                    onclick: () => {

                        if (this.selection.length != 0) {


                            let selection = this.selection.sort((prev, next) =>

                                $(prev).attr("row") * 1 - $(next).attr("row") * 1

                            )



                            selection.forEach(item => {

                                if ($(item).attr("row") == $(selection[0]).attr("row")) {
                                    $(item).css({ "border-top": "solid 1px black" })
                                    let element = item
                                    let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                                    cell.borders = { ...cell.borders, top: "solid 1px black" }
                                }
                            })




                        } else {
                            $(this.selectedobject).css({ "border-top": "solid 1px black" })

                            let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                            cell.borders = { ...cell.borders, top: "solid 1px black" }
                        }
                    }
                },
                {
                    name: "right",
                    type: "button",
                    caption: "",
                    picture: "right.png",
                    onclick: () => {



                        if (this.selection.length != 0) {


                            let selection = this.selection.sort((prev, next) =>

                                $(next).attr("col") * 1 - $(prev).attr("col") * 1

                            )


                            selection.forEach(item => {

                                if ($(item).attr("col") == $(selection[0]).attr("col")) {

                                    $(item).css({ "border-right": "solid 2px black" })


                                    let element = item
                                    let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                                    cell.borders = { ...cell.borders, right: "solid 1px black" }
                                }
                            })




                        }

                        else {
                            $(this.selectedobject).css({ "border-right": "solid 2px black" })
                            let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                            cell.borders = { ...cell.borders, right: "solid 1px black" }
                        }
                    }
                }

                ,
                {
                    name: "bottom",
                    type: "button",
                    caption: "",
                    picture: "bottom.png",
                    onclick: () => {


                        if (this.selection.length != 0) {


                            let selection = this.selection.sort((prev, next) =>

                                $(next).attr("row") * 1 - $(prev).attr("row") * 1


                            )


                            selection.forEach(item => {

                                if ($(item).attr("row") == $(selection[0]).attr("row")) {

                                    $(item).css({ "border-bottom": "solid 2px black" })

                                    let element = item
                                    let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                                    cell.borders = { ...cell.borders, bottom: "solid 1px black" }
                                }
                            })




                        }

                        else {

                            $(this.selectedobject).css({ "border-bottom": "solid 2px black" })

                            let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                            cell.borders = { ...cell.borders, bottom: "solid 1px black" }
                        }
                    }
                }
                ,
                {
                    name: "left",
                    type: "button",
                    caption: "",
                    picture: "left.png",
                    onclick: () => {
                        if (this.selection.length != 0) {


                            let selection = this.selection.sort((prev, next) =>

                                $(prev).attr("col") * 1 - $(next).attr("col") * 1

                            )


                            selection.forEach(item => {

                                if ($(item).attr("col") == $(selection[0]).attr("col")) {

                                    $(item).css({ "border-left": "solid 2px black" })
                                    let element = item
                                    let cell = this.gridData.find(item => item.col == $(element).attr("col") && item.row == $(element).attr("row"))
                                    cell.borders = { ...cell.borders, left: "solid 1px black" }
                                }
                            })




                        }

                        else {
                            $(this.selectedobject).css({ "border-left": "solid 2px black" })
                            let cell = this.gridData.find(item => item.col == $(this.selectedobject).attr("col") && item.row == $(this.selectedobject).attr("row"))
                            cell.borders = { ...cell.borders, left: "solid 1px black" }

                        }
                    }
                },


                {
                    name: "outer",
                    type: "button",
                    caption: "",
                    picture: "left.png",
                    onclick: () => {
                        /////все границы
                        if (this.selection.length > 1) {
                            ////верхняя граница

                            let selection = this.selection.sort((prev, next) =>

                                $(prev).attr("row") * 1 - $(next).attr("row") * 1

                            )



                            selection.forEach(item => {

                                if ($(item).attr("row") == $(selection[0]).attr("row")) {
                                    $(item).css({ "border-top": "solid 1px black" })
                                }
                            })
                            ////правая граница
                            selection = this.selection.sort((prev, next) =>

                                $(next).attr("col") * 1 - $(prev).attr("col") * 1

                            )


                            selection.forEach(item => {

                                if ($(item).attr("col") == $(selection[0]).attr("col")) {

                                    $(item).css({ "border-right": "solid 2px black" })
                                }
                            })

                            ////нижняя граница
                            selection = this.selection.sort((prev, next) =>

                                $(next).attr("row") * 1 - $(prev).attr("row") * 1

                            )


                            selection.forEach(item => {

                                if ($(item).attr("row") == $(selection[0]).attr("row")) {

                                    $(item).css({ "border-bottom": "solid 2px black" })
                                }
                            })

                            ////левая граница

                            selection = this.selection.sort((prev, next) =>

                                $(prev).attr("col") * 1 - $(next).attr("col") * 1

                            )


                            selection.forEach(item => {

                                if ($(item).attr("col") == $(selection[0]).attr("col")) {

                                    $(item).css({ "border-left": "solid 2px black" })
                                }
                            })

                        }
                        else {
                            $(this.selectedobject).css({ "border": "solid 2px black" })
                        }


                    }
                }


            ]
        })


        this.lpanel = new panel(".panels", {
            name: "groupping",

            visible: true,
            caption: "Группировка",
            items: [



                {
                    name: "group",
                    type: "button",
                    caption: "",
                    picture: "group.png",
                    onclick: () => { $(this.selectedobject).css({ "border-top": "solid 1px black" }) }
                },
                {
                    name: "ungroup",
                    type: "button",
                    caption: "",
                    picture: "ungroup.png",
                    onclick: () => {
                        $(this.selectedobject).css({ "border-right": "solid 2px black" })
                        console.log("right")
                    }
                }



            ]
        })

        this.lpanel = new panel(".panels", {
            name: "file",
            visible: true,
            caption: "Файл",
            items: [


                {

                    name: "open",
                    type: "button",
                    caption: "",
                    picture: "open.png",
                    onclick: () => {

                        $(this.selectedobject).css({ "justify-content": "flex-start" })
                        this.selection.forEach(element => {
                            $(element).css({ "justify-content": "flex-start" })

                        })

                    }
                },
                {
                    name: "save",
                    type: "button",
                    caption: "",
                    picture: "save.png",
                    onclick: () => {
                        $(eval("this.selectedobject")).css({ "justify-content": "center" })
                        this.selection.forEach(element => {
                            $(element).css({ "justify-content": "center" })

                        })

                    }
                }

                ,
                {
                    name: "new",
                    type: "button",
                    caption: "",
                    picture: "new.png",
                    onclick: () => {
                        $(this.selectedobject).css({ "justify-content": "flex-end" })
                        this.selection.forEach(element => {
                            $(element).css({ "justify-content": "flex-end" })

                        })
                    }

                },
                {
                    name: "print",
                    type: "button",
                    caption: "Печать",
                    picture: "print.png",
                    onclick: () => {


                        this.printer = this.printer ? this.printer : new print()
                        this.printer.execute({ test: "wow" }, {
                            type: "current",
                            preview: true,
                            previewsource: $(target).find('.gridcontainer'),
                            gridData: this.gridData,
                            range: {
                                startcol: 2,
                                endcol: 50,
                                startrow: 2,
                                endrow: 50
                            },
                            colwidths: this.colwidths(2, 50, $(this.selectedobject).parent()),
                            rowheights: this.rowheights(2, 50, $(this.selectedobject).parent()),
                        })
                    }

                }]

        })


        this.lpanel = new panel(null, {
            name: "dataset",
            visible: true,
            caption: "Данные"

        })






        let panellTop = localStorage.getItem($("#dataset").attr("id") + "_top");
        let panellLeft = localStorage.getItem($("#dataset").attr("id") + "_left");
        let panellHeight = localStorage.getItem($("#dataset").attr("id") + "_height");


        if (panellTop && panellLeft) {
            $("#dataset").css({ top: panellTop, left: panellLeft, height: panellHeight + "px" })



        }


        this.filestruct = new panel(null, {
            name: "files",
            visible: true,
            caption: "Файлы",
            height: 600

        })


        let panellTop2 = localStorage.getItem($("#files").attr("id") + "_top");
        let panellLeft2 = localStorage.getItem($("#files").attr("id") + "_left");
        let panellHeight2 = localStorage.getItem($("#files").attr("id") + "_height");


        if (panellTop2 && panellLeft2) {
            $("#files").css({ top: panellTop2, left: panellLeft2, height: panellHeight2 + "px" })



        }




        let filedata = await fileobj.getstructure();

        console.log(filedata);
        let filetree = new tree(this.filestruct, filedata, {
            name: "test", click: async (path) => {

                if (path.type == "file") {

                    this.file = await fileobj.openFile(path.path + "/" + path.name)

                    this.builddata(this.target, this.params, this.file)
                    console.log("this.file", this.file)

                    filecontent.maketree(this.filecontent, this.file ? this.file : [], {
                        name: "test", groupimg: "filesystem/folder.png", itemimg: "filesystem/file.png", type: 3
                    })

                    settings.lastfiles = path.path + "/" + path.name;

                    console.log("Путь ", path.path + "/" + path.name, "th.settings.lastfiles", th.settings.lastfiles)

                }


            }, groupimg: "filesystem/folder.png", itemimg: "filesystem/file.png", type: 2, current: this.settings.lastfiles
        })




        ///////////////////////////////////////////////



        panellTop2 = localStorage.getItem($("#filecontent").attr("id") + "_top");
        panellLeft2 = localStorage.getItem($("#filecontent").attr("id") + "_left");
        panellHeight2 = localStorage.getItem($("#filecontent").attr("id") + "_height");
        this.filecontent.lastheight = panellHeight2;


        if (panellTop2 && panellLeft2) {
            $("#filecontent").css({ top: panellTop2, left: panellLeft2, height: panellHeight2 + "px" })



        }






        /*
        for (let row = 1; row <= params.rowcount + 1; row++) {

            this.currentletters = [63]
            for (let col = 1; col <= params.colcount + 1; col++) {

                letter = this.gridheaderletter()

                this.gridData.push({ col: col, row: row, data: "", datatype: "", font: null, borders: null, valign: null, galign: null, colspan: null, rowspan: null })


                $(target).find(".data").append('<div adress="' + letter + (row - 1) + '" col="' + col + '" row="' + row + '" class="griditem ' + (col == 1 || row == 1 ? "fixed" : "") + '" style="margin-left:-1px;' + ((col != 1) ? "margin-left:-1px;" : "") + ((row != 1) ? "margin-top:-1px;" : "") + 'height:20px">' + (col == 1 ? (row - 1 != 0 ? row - 1 : "") : "") + (row == 1 && col != 1 ? letter : "") + '</div>')

            }

        }

*/




        let ltree = new tree(this.lpanel, { name: "", test: "", level2: { test: "", test2: "" } }, {
            name: "test", css: { obj: {}, content: { "display": "block", height: "calc(100% - 40px)" } }, click: (path) => {


                this.selectedobject.forEach(obj => {


                    $(obj).html('<img src="img/dataset/dataitem.png">' + path.split("/")[path.split("/").length - 1])
                    $(obj).attr({ path: path })
                    $(obj).attr({ type: "dataset" })
                    let cell = this.gridData.find(item => item.col == $(obj).attr("col") && item.row == $(obj).attr("row"))
                    cell.datatype = "dataset"
                    cell.data = path


                })
            }
        })

        let border = $(".griditem").css("border")
        let that = this



        $(".griditem").click({ data: this }, function () {
            if (($(this).attr("row") * 1 != 1) && ($(this).attr("col") * 1 != 1)) {
                $(".griditem").css({ "box-shadow": "none" })
                $(this).css({ "box-shadow": "0px 0px 0px 2px inset black" })
                //that.cursor.left = ;
                if ($(target).find(".footer").find(".selectioninfo").length == 0) $(target).find(".footer").append('<div class="selectioninfo"></div>')
                $(target).find(".footer").find(".selectioninfo").html("")

                that.selectedobject = [this];
                $(target).find(".gridselector").hide()
            }
        })
        that.resizingCol = -1;
        that.resizingRow = -1;

        $(".griditem").mousemove(function (event) {

            let offset = $(this).offset();

            let relX = event.pageX - offset.left;
            let relY = event.pageY - offset.top;


            if (that.mouseAction == "") {
                if ($(this).attr("row") * 1 == 1) {

                    //переделать при реализации функции объединения ячеек
                    if (relX < 5) {
                        that.resizingCol = $(this).attr("col") - 2

                        $(this).css({ "cursor": "col-resize" })
                    } else {
                        if (relX > $(this).width() - 5) {
                            that.resizingCol = $(this).attr("col") - 1

                            $(this).css({ "cursor": "col-resize" })
                        }
                        else {
                            $(this).css({ "cursor": "pointer" })

                            that.resizingCol = -1
                        }
                    }



                }



                if ($(this).attr("col") * 1 == 1) {


                    if (relY < 5) {
                        that.resizingRow = $(this).attr("row") - 1

                        $(this).css({ "cursor": "row-resize" })
                    } else {
                        if (relY > $(this).height() - 5) {
                            that.resizingRow = $(this).attr("row")

                            $(this).css({ "cursor": "row-resize" })
                        }
                        else {
                            $(this).css({ "cursor": "pointer" })
                            that.resizingRow = -1
                        }
                    }

                }
            }
        })



        $(".griditem").mousedown(function (event) {
            that.mousedownPos.x = event.pageX
            that.mousedownPos.y = event.pageY
            that.mouseAction = "selecting"
            that.selectedobject = [this]

            if ($(this).attr("row") * 1 == 1) {
                $(target).find(".gridselector").hide()
                that.mouseAction = "resizeCol"
                that.resizingColWidth = $(this).width()
            }

            if ($(this).attr("col") * 1 == 1) {
                $(target).find(".gridselector").hide()
                that.mouseAction = "resizeRow"
                that.resizingRowHeight = $(this).height()
            }

        })


        $(target).mouseup(function (event) {

            that.mouseAction = ""


        })


        $(".griditem").mousemove(function () {

            switch (that.mouseAction) {
                case "selecting":
                    const startrow = $(that.selectedobject).attr("row")
                    const startcol = $(that.selectedobject).attr("col")

                    const startselection = that.objdimensions(that.selectedobject)

                    const endselection = that.objdimensions(this)



                    const selection = that.selectionsize(startselection, endselection)
                    if ($(target).find(".footer").find(".selectioninfo").length == 0) $(target).find(".footer").append('<div class="selectioninfo"></div>')
                    $(target).find(".footer").find(".selectioninfo").html("выделено " + $(that.selectedobject).attr("adress") + ":" + $(this).attr("adress"))



                    if ($(target).find(".gridselector").length == 0) $(target).find(".gridcontainer").append('<div class="gridselector" style="display:none;"></div>')

                    $(target).find(".gridselector").css({ "display": "block", "position": "absolute" })
                    $(target).find(".gridselector").width(selection.width - 2)
                    $(target).find(".gridselector").height(selection.height - 2)


                    $(target).find(".gridselector").offset({ left: selection.left, top: selection.top })

                    //  $(target).find(".gridselector").offset({left:0,top:50})
                    $(".griditem").css({ "box-shadow": "none" })
                    $(this).css({ "box-shadow": "0px 0px 0px 2px inset black" })
                    console.log(selection)

                    const endrow = $(this).attr("row")
                    const endcol = $(this).attr("col")
                    // $(".griditem").css({ "box-shadow": "none" })
                    that.selection = []
                    for (let col = Math.min(startcol, endcol); col <= Math.max(startcol, endcol); col++) {
                        for (let row = Math.min(startrow, endrow); row <= Math.max(startrow, endrow); row++) {

                            that.selection.push($(target).find(".gridcontainer").find("[col=" + col + "][row=" + row + "]"))

                        }

                    }


                    break;

            }
        })


        $(target).mousemove(function (event) {
            console.log(that.mouseAction)
            switch (that.mouseAction) {
                case "resizeCol":

                    const colwidth = that.resizingColWidth + event.pageX - that.mousedownPos.x

                    $("[col=" + that.resizingCol + "]").parent().each(function () {



                        let currentwidtharray = $(this).css("grid-template-columns").split(" ")
                        const currentwidth = currentwidtharray[that.resizingCol].slice(0, currentwidtharray[that.resizingCol].length - 2) * 1



                        currentwidtharray[that.resizingCol] = colwidth + "px"

                        $(this).css({ "grid-template-columns": currentwidtharray.join(" ") })



                    })





                    break


                case "resizeRow":

                    const rowwheight = that.resizingRowHeight + event.pageY - that.mousedownPos.y
                    let rowheights = $("[row=" + that.resizingRow + "]").parent().css("grid-template-rows").split(" ")
                    rowheights[that.resizingRow - 1] = (rowwheight) + "px"

                    $("[row=" + that.resizingRow + "]").parent().css({ "grid-template-rows": rowheights.join(" ") })

                    rowheights = $("[row=" + that.resizingRow + "]").parent().css("grid-template-rows")
                    console.log(rowheights)
                    $("[row=" + that.resizingRow + "]").height(rowwheight - 1)









                    break
                case "":
                    break
            }
            /*
            
        */
        })

        $(".griditem").dblclick({ data: this }, function () {
            if (($(this).attr("row") * 1 != 1) && ($(this).attr("col") * 1 != 1)) {
                $(this).html('<input class="celleditor" id="celleditor" type="text" value="' + $(this).html() + '">')

                $("#celleditor").focus()
                //$("#celleditor").off("dblclick");
                let that = this
                $("#celleditor").keydown(function (event) {
                    if (event.keyCode == 13) {
                        let dataitem = _gridData.find(item => item.col == $(that).attr("col") && item.row == $(that).attr("row"))
                        if (dataitem) {

                            dataitem.data = $(this).val()
                            console.log("элемент найден", _gridData, dataitem)
                        }
                        else {
                            console.log("элемент не найден")
                        }
                        $(that).html($(this).val())

                    }

                });
            }

        })




        $("body", "html").keydown({ data: this }, (event) => {
            console.log(this.selectedobject)
            console.log($("#celleditor").length)

            switch (event.keyCode) {
                case 37:
                    if ($(this.selectedobject).attr("col") - 1 > 1) {
                        $(this.selectedobject).css({ "box-shadow": "none" })
                        that = this

                        $(target).find("[row=" + ($(this.selectedobject).attr("row")) + "]").each(function () {
                            if ($(this).attr("col") == $(that.selectedobject).attr("col") - 1) {
                                $(this).css({ "box-shadow": "0px 0px 0px 2px inset black" })
                                that.selectedobject = [$(this)]

                            }

                        })



                    }
                    return false
                case 38:
                    if ($(this.selectedobject).attr("row") - 1 > 1) {
                        $(this.selectedobject).css({ "box-shadow": "none" })
                        that = this

                        $(target).find("[col=" + ($(this.selectedobject).attr("col")) + "]").each(function () {
                            if ($(this).attr("row") == $(that.selectedobject).attr("row") - 1) {
                                $(this).css({ "box-shadow": "0px 0px 0px 2px inset black" })
                                that.selectedobject = [$(this)]

                            }

                        })



                    }
                    return false
                case 39:

                    if ($(this.selectedobject).attr("col") * 1 + 1 < params.colcount) {
                        $(this.selectedobject).css({ "box-shadow": "none" })
                        that = this

                        let t = $(target).find("[row=" + ($(this.selectedobject).attr("row")) + "]")
                        console.log(t)
                        t.each(function () {

                            if ($(this).attr("col") == $(that.selectedobject).attr("col") * 1 + 1) {
                                $(this).css({ "box-shadow": "0px 0px 0px 2px inset black" })
                                that.selectedobject = [$(this)]
                                return false
                            }

                        })



                    }
                    return false
                case 40:


                    if ($(this.selectedobject).attr("row") * 1 + 1 < params.colcount) {
                        $(this.selectedobject).css({ "box-shadow": "none" })
                        that = this

                        let t = $(target).find("[col=" + ($(this.selectedobject).attr("col")) + "]")
                        console.log(t)
                        t.each(function () {

                            if ($(this).attr("row") == $(that.selectedobject).attr("row") * 1 + 1) {
                                $(this).css({ "box-shadow": "0px 0px 0px 2px inset black" })
                                that.selectedobject = [$(this)]
                                return false
                            }

                        })



                    }
                    return false


            }


            if (!$("#celleditor").length) {

                $(this.selectedobject).html('<input class="celleditor" id="celleditor" type="text" value="' + $(this.selectedobject).html() + '">')
                $("#celleditor").focus()



                $("#celleditor").off("dblclick");


                let that = this.selectedobject
                $("#celleditor").keydown(function (event) {
                    if (event.keyCode == 13) {
                        let dataitem = _gridData.find(item => item.col == $(that).attr("col") && item.row == $(that).attr("row"))
                        if (dataitem) {

                            dataitem.data = $(this).val()
                            console.log("элемент найден", _gridData, dataitem)
                        }
                        else {
                            console.log("элемент не найден")
                        }

                        $(that).html($(this).val())
                        return false
                    }

                });
            }

        })



    }

    gridheaderletter() {

        if (this.currentletters[this.currentletters.length - 1] + 1 > 90) {
            this.currentletters[this.currentletters.length - 1] = 64

            if (this.currentletters.length == 1) {
                this.currentletters.unshift(65)

            }
            else {
                this.currentletters[this.currentletters.length - 2] = this.currentletters[this.currentletters.length - 2] + 1

            }
        }

        this.currentletters[this.currentletters.length - 1] = this.currentletters[this.currentletters.length - 1] + 1




        return this.currentletters.map(item => String.fromCharCode(item)).join("")
    }


    objdimensions(obj) {
        return {
            topleft: {
                x: $(obj).offset().left,
                y: $(obj).offset().top
            },
            topright: {
                x: $(obj).offset().left + $(obj).width(),
                y: $(obj).offset().top
            },
            bottomleft: {
                x: $(obj).offset().left,
                y: $(obj).offset().top + $(obj).height()
            },
            bottomright: {
                x: $(obj).offset().left + $(obj).width(),
                y: $(obj).offset().top + $(obj).height()
            },


        }


    }
    selectionsize(start, end) {
        console.log(start, end)
        let result = { top: -1, left: -1, width: 0, height: 0 }

        if (end.topright.x >= start.topright.x) {
            result.left = start.topleft.x
            result.width = end.topright.x - start.topleft.x
        }
        else {
            result.left = end.topleft.x
            result.width = start.topright.x - end.topleft.x
        }



        if (end.bottomright.y >= start.bottomright.y) {
            result.top = start.topleft.y
            result.height = end.bottomright.y - start.topleft.y
        }
        else {
            result.top = end.topleft.y
            result.height = start.bottomright.y - end.topleft.y
        }
        return result

    }


    colwidths(start, end, obj) {
        let result = ""
        for (let t = start; t <= end; t++) {
            result = result + obj.find("[col=" + t + "][row=1]").width() + "px "


        }
        return result


    }
    rowheights(start, end, obj) {

        let result = ""
        for (let t = start; t <= end; t++) {
            result = result + obj.find("[row=" + t + "][col=1]").height() + "px "


        }
        return result


    }

    builddata(target, params, data = "") {
        console.log("цель отрисовки таблицы", target)
        $(target).find(".data").html("");
        if (data == "") {

            for (let row = 1; row <= params.rowcount + 1; row++) {

                this.currentletters = [63]
                for (let col = 1; col <= params.colcount + 1; col++) {

                    let letter = this.gridheaderletter()

                    this.gridData.push({ col: col, row: row, data: "", datatype: "", font: null, borders: null, valign: null, galign: null, colspan: null, rowspan: null })


                    $(target).find(".data").append('<div adress="' + letter + (row - 1) + '" col="' + col + '" row="' + row + '" class="griditem ' + (col == 1 || row == 1 ? "fixed" : "") + '" style="margin-left:-1px;' + ((col != 1) ? "margin-left:-1px;" : "") + ((row != 1) ? "margin-top:-1px;" : "") + 'height:20px">' + (col == 1 ? (row - 1 != 0 ? row - 1 : "") : "") + (row == 1 && col != 1 ? letter : "") + '</div>')

                }
            }

        }
        else {
            for (let row = 1; row <= params.rowcount + 1; row++) {

                this.currentletters = [63]
                for (let col = 1; col <= params.colcount + 1; col++) {

                    let letter = this.gridheaderletter()

                    this.gridData.push({ col: col, row: row, data: "", datatype: "", font: null, borders: null, valign: null, galign: null, colspan: null, rowspan: null })


                    $(target).find(".data").append('<div adress="' + letter + (row - 1) + '" col="' + col + '" row="' + row + '" class="griditem ' + (col == 1 || row == 1 ? "fixed" : "") + '" style="margin-left:-1px;' + ((col != 1) ? "margin-left:-1px;" : "") + ((row != 1) ? "margin-top:-1px;" : "") + 'height:20px">' + (col == 1 ? (row - 1 != 0 ? row - 1 : "") : "") + (row == 1 && col != 1 ? letter : "") + this.cellText(row, col, data) + '</div>')

                    this.setprops(target, data, col, row)
                }






            }
            for (let obj = 1; obj < data.objects.length; obj++) {

                if (data.objects[obj].type * 1 == 5) {
                    //                    console.log(data.objects[obj].file)

                    let filepath = this.settings.lastfiles.split("/").filter(item => item != "")
                    let file = filepath[filepath.length - 1].split(".")[0]
                    filepath = filepath.filter((item, index, arr) => index != arr.length - 1).join("/")
                    filepath = filepath + "/" + data.objects[obj].file;

                    console.log("filepath", filepath)

                    $(target).find(".data").parent().append('<div class="pictures"><img src="data/'+filepath+'"/></div>')


                }



            }
            this.applycolwidth(data, target)
            //   this.applyrowheight(data, target)
        }


    }
    cellText(row, col, data) {
        if (col == 1 || row == 1) return ""
        if (!data.cells[row - 1]) return ""
        if (!data.cells[row - 1][col - 2]) return ""
        if (!data.cells[row - 1][col - 2].Text) return ""
        return data.cells[row - 1][col - 2].Text

    }

    setprops(target, data, col, row) {

        if (col == 1 || row == 1) return ""
        if (!data.cells[row - 1]) return ""
        if (!data.cells[row - 1][col - 2]) return ""

        let css = {};


        if ((data.cells[row - 1][col - 2].fontBold_flag == "true" || data.cells[row - 1][col - 2].fontBold_flag == true) && data.cells[row - 1][col - 2].fontbold_value * 1 == 7) {
            css["font-weight"] = "bold"
        }


        if (data.cells[row - 1][col - 2].fontSize_flag == "true" || data.cells[row - 1][col - 2].fontSize_flag == true) {
            css["font-size"] = data.cells[row - 1][col - 2].fontsize_value / -4
        }



        if ((data.cells[row - 1][col - 2].horizontal_flag == true || data.cells[row - 1][col - 2].horizontal_flag == "true") && data.cells[row - 1][col - 2].Align_value * 1 == 24) {
            css["display"] = "flex";
            css["justify-content"] = "center"
        }



        if ((data.cells[row - 1][col - 2].frameLeft_flag == true || data.cells[row - 1][col - 2].frameLeft_flag == "true")) {
            css["border-left"] = "inset 2px black";
            //css["color"]="red";

        }

        if ((data.cells[row - 1][col - 2].frameTop_flag == true || data.cells[row - 1][col - 2].frameTop_flag == "true")) {
            css["border-top"] = "inset 2px black";
            //css["color"]="red";

        }


        if ((data.cells[row - 1][col - 2].frameBottom_flag == true || data.cells[row - 1][col - 2].frameBottom_flag == "true")) {
            css["border-bottom"] = "inset  2px black";
            //css["color"]="red";

        }


        if ((data.cells[row - 1][col - 2].frameRight_flag == true || data.cells[row - 1][col - 2].frameRight_flag == "true")) {
            css["border-bottom"] = "inset  2px black";
            //css["color"]="red";

        }


        $(target).find("[col=" + col + "][row=" + row + "]").css(css)
        let that = this
        $(target).find("[col=" + col + "][row=" + row + "]").click(function () {
            console.log($(this).attr("col"), this)
        })



    }



    applycolwidth = (data, target) => {
        console.log("data.cols", data.cols)

        for (var key in data.cols) {


            $("[col=" + (1 + key) + "]").parent().each(function () {

                console.log("1+key: ", 1 + key * 1, key)
                console.log(data.cols[1 + key * 1])

                let currentwidtharray = $(this).css("grid-template-columns").split(" ")
                currentwidtharray[1 + key * 1] = data.cols[key * 1].main2_value + "px"



                $(this).css({ "grid-template-columns": currentwidtharray.join(" ") })



            })




        }

    }



    applyrowheight = (data, target) => {
        console.log("data.rows", data.rows)

        for (var key in data.rows) {

            $("[row=" + (1 + key * 1) + "]").each(function () {
                if (data.rows[key * 1 + 1]) {
                    if (data.rows[key * 1 + 1].main1_flag) {
                        $(this).css({ "height": data.rows[key * 1 + 1].main1_value + "px" })
                    }
                }
                //  console.log(this, "[row=" + (1 + key * 1) + "]", { "height": data.rows[key * 1 + 1].main1_value + "px" }, data.rows[key * 1 + 1].main1_flag)




            })
            console.log("Строка: ", 1 + key * 1, key)
            if (data.rows[key * 1 + 1]) {
                if (data.rows[key * 1 + 1].main1_flag) { console.log(data.rows[1 + key * 1].main1_flag, data.rows[1 + key * 1].main1_value) }
            }




        }

    }




}