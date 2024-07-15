export default class print {




    execute(dataset, params) {

        if (params.preview) {

            if ($(".preview").length == 0) { $('body').append('<div class="preview" style="display:none"><div class="header"><div class="header"><div>Предварительный просмотр</div><div class="close"></div></div></div><div class="menu"></div><div class="content"><div class="sheet"></div></div><div class="footer"><div class="button print">Печать</div></div></div>') }
            $(".preview").fadeIn(1000)
            $(".preview").find(".content").find(".sheet").html('')
            
            $(".preview").find(".content").find(".sheet").css({ "display": "grid"})
            
            

            $(".preview").find(".content").find(".sheet").css({"grid-template-columns": params.colwidths, "grid-template-rows": params.rowheights })
            


            for (let row = params.range.startrow; row <= params.range.endrow; row++) {

                for (let col = params.range.startcol; col <= params.range.endcol; col++) {

               

                    let cell = params.gridData.find(item => item.col == col && item.row == row)
                    console.log(cell)
                    let datatype = cell ? cell.datatype : "";

                 
                    let datapath = cell ? cell.data : "";

                    console.log(datapath)

                    let data = datatype == "dataset" ? this.preparePath(dataset, datapath ? datapath : "") : cell ? cell.data : "";






                    $(".preview").find(".content").find(".sheet").append('<div class="printitem" col="' + col + '" row="' + row + '">' + data + '</div>')

                    let printitem = $(".preview").find("[col=" + col + "][row=" + row + "]")


                    if (data!="") console.log("data",data,cell)
                    printitem.css({
                         "border-top": cell.borders?cell.borders.top:"", 
                         "border-bottom": cell.borders?cell.borders.bottom:"",
                         "border-left": cell.borders?cell.borders.left:"",
                         "border-right": cell.borders?cell.borders.right:"",
                         "display":"flex",
                         "justify-content": cell.galign?cell.galign:"center",
                         "align-items": cell.valign?cell.valign:"center"
                        
                        })

                }



            }

            $(".header").find(".close").click(function () {
                $(".preview").fadeOut(1000)

            })


        }

    }

    preparePath(dataset, path) {

        let patharray = path.split("/")

        console.log("patharray", patharray, patharray.length)
        let result = dataset

        for (let t = 1; t <= patharray.length - 1; t++) {

            result = result ? result[patharray[t]] : ""

        }



        return result ? result : "";
    }

}