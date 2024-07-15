import gdEditor from "./grid.js"


$(function(){

   let gridEditor=new gdEditor()

    
console.log("gridresult", gridEditor.buildGrid(".gridtest",{colcount:50,rowcount:50}))


})