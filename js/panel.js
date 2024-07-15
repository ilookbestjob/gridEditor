
import motions from "./motions.js";


export default class panel extends motions {

    minimized = false
    lastheight

    constructor(target, params) {

        if (target) {

            $(target).append('<div class="panel" style="' + (params.visible ? "" : "display:none") + '" id="' + params.name + '"><div class="header">' + params.caption + '</div><div class="content"></div></div>')
            if (params.items) params.items.forEach(element => {

                switch (element.type) {
                    case "button":
                        $(target).find("#" + params.name).find(".content").append('<div class="button"  id="' + params.name + '_' + element.name + '">' + (element.picture !== "" ? "<img src=/img/panels/" + params.name + "/" + element.picture + ">" : "") + (element.caption !== "" ? element.caption : "") + "</div>")

                        $('#' + params.name + '_' + element.name).click({ action: element.onclick }, function (event) {


                            if (event.data.action) event.data.action()


                        })
                        break
                }




            });


        }


        else {
            $("body").append('<div class="freepanel" style="' + (params.visible ? "" : "display:none") + '" id="' + params.name + '"><div class="header"><div>' + params.caption + '</div><div class="close"></div></div></div><div class="content"></div></div>')

            $("body").find("#" + params.name).css({ "position": "fixed", top: 0, left: 0, right: 0, bottom: 0, margin: "auto" })


            $("body").find("#" + params.name).find(".close").click(function () {
                $("body").find("#" + params.name).fadeOut()
            })

            console.log("params.height", params.height)

            super({
                responsive: $("body").find("#" + params.name).find(".header"),
                objtomove: $("body").find("#" + params.name)

            })


            if (params.height) {
                this.lastheight = params.height
                $("body").find("#" + params.name).css({ height: params.height + "px" })

            }

            let that = this;
            $("body").find("#" + params.name).find(".header").dblclick(function () {
                if ($("body").find("#" + params.name).height() == $(this).height() + 5) {
                    $("body").find("#" + params.name).height(that.lastheight)
                    localStorage.setItem(params.name + "_height", that.lastheight);
                }
                else {

                    $("body").find("#" + params.name).height($(this).height() + 5)
                    localStorage.setItem(params.name + "_height", $(this).height() + 5);
                }


            })

        }


        return $("body").find("#" + params.name)
    }

}