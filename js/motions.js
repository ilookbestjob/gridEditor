export default class motions {

    startMousePos = { x: 0, y: 0 }
    startObjPos = { left: 0, right: 0 }
    Obj = null

    constructor(data) {

        let that = this

        $(data.responsive).mousedown(function (event) {
            that.Obj = data.objtomove
            that.startObjPos = $(data.objtomove).offset()
            that.startMousePos.x = event.clientX
            that.startMousePos.y = event.clientY
        
        })

        $("body,html").mousemove(
            function (event) {

           
                if (that.Obj) {
                 
                    $(that.Obj).offset({
                        left: event.clientX - that.startMousePos.x + that.startObjPos.left,
                        top: event.clientY - that.startMousePos.y + that.startObjPos.top
                    })


                }


            }
        )


        $("body", "html").mouseup(
            function () { 
                if (that.Obj){

                localStorage.setItem($(that.Obj).attr("id")+"_left", $(that.Obj).position().left);
                localStorage.setItem($(that.Obj).attr("id")+"_top", $(that.Obj).position().top);
                
                that.Obj = null }
            
            }
        )


    }

}