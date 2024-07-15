
export default class tree {

    constructor(target, data, params) {
        this.maketree(target, data, params)
           }


    buildDragData(dragitem) {
        let result = [];
        let that = this
        $(dragitem).parent().children().each(function () {
            console.log(this)
            if ($(this).hasClass("treeitemgroup")) {

                result = { ...result, [$(this).attr("data")]: that.buildDragData(this) }



            }
            result = { ...result, [$(this).attr("data")]: "" }




        })
        return result
    }

    buildcontent(data, params, offset = 0, path = "") {


        let result = ""
        let type = params.type ? params.type : 1

        switch (type) {
            case 1:
                for (var key in data) {


                    result = result + ((typeof data[key] === 'object' ||
                        Array.isArray(data[key])) ? '<div class="treeitemgroup" data="' + key + '" path="' + path + '/' + key + '"><div class="treegroupheader"><img src="img/' + (params.groupimg ? params.groupimg : 'dataset/dataset.png') + '">' + key + '</div>' + this.buildcontent(data[key], params, offset + 20, path + '/' + key) + '</div>' : '<div class="treeitem" style="width:calc(100% - ' + offset + 'px);padding-left:' + offset + 'px" data="' + key + '" path="' + path + '/' + key + '"><img src="img/' + (params.itemimg ? params.itemimg : 'dataset/dataitem.png') + '">' + key + '</div>')

                }
                break;
            case 2:

                data.forEach(item => {


                    result = result + '<div class="treeitem" style="width:calc(100% - ' + (item.level - 1) * 20 + 'px);padding-left:' + (item.level - 1) * 20 + 'px" data-path="'+item.baseroot+'" data-type="'+item.type+'" data-name="'+item.name+'"><img src="img/' + (item.type == "dir" ? ((params.groupimg ? params.groupimg : 'dataset/dataset.png')) : ((params.itemimg ? params.itemimg : 'dataset/dataitem.png'))) + '">' + item.name + '</div>'

                })
                break;
                    case 2:

                data.forEach(item => {


                    result = result + '<div class="treeitem" style="width:calc(100% - ' + (item.level - 1) * 20 + 'px);padding-left:' + (item.level - 1) * 20 + 'px" data-path="'+item.baseroot+'" data-type="'+item.type+'" data-name="'+item.name+'"><img src="img/' + (item.type == "dir" ? ((params.groupimg ? params.groupimg : 'dataset/dataset.png')) : ((params.itemimg ? params.itemimg : 'dataset/dataitem.png'))) + '">' + item.name + '</div>'

                })
                break;
                case 3:
                    for (var key in data) {
    
    
                        result = result + ((typeof data[key] === 'object' ||
                            Array.isArray(data[key])) ? '<div class="treeitemgroup" data="' + key + '" path="' + path + '/' + key + '"><div class="treegroupheader"><img src="img/' + (params.groupimg ? params.groupimg : 'dataset/dataset.png') + '">' + key + '</div>' + this.buildcontent(data[key], params, offset + 20, path + '/' + key) + '</div>' : '<div class="treeitem" style="width:calc(100% - ' + offset + 'px);padding-left:' + offset + 'px" data="' + key + '" path="' + path + '/' + key + '"><img src="img/' + (params.itemimg ? params.itemimg : 'dataset/dataitem.png') + '">' + key+"="+ data[key]+'</div>')
    
                    }

        }


        return result

    }

    preparecontent(content) {


    }


    async maketree(target, data, params){
        $(target).css({"display":"block","overflow":"hidden"});


        $(target).append('<div class="treecontainer" id="' + params.name + '"><div class="menu"></div><div class="content">' +
            this.buildcontent(data, params) + '</div><div class="footer"></div></div>')

    
        let that = this
        $(".treegroupheader,.treeitem").mousedown(function () {
            //params.click()
            let datastruct = !$(this).parent().hasClass("content") ? { [$(this).parent().attr("data")]: that.buildDragData(this) } : { [$(this).attr("data")]: "" }

            let path = $(this).hasClass("treegroupheader") ? $(this).parent().attr("path") : $(this).attr("path")




        })

        $(target).find(".treegroupheader,.treeitem").click(function () {
            
            let type=params.type?params.type:1;

            console.log(type);
            if (type==1){
            let path = $(this).hasClass("treegroupheader") ? $(this).parent().attr("path") : $(this).attr("path")

            params.click(path)
            }


            if (type==2){
                let data = {type:$(this).attr("data-type") ,path:$(this).attr("data-path"),name:$(this).attr("data-name")}
    
                params.click(data)
                }


        })




    }


}