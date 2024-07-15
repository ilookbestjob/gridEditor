
export default class filesystem {

    root = "http://grideditor.ru/backend/";
    constructor(root = false) {

        this.root = !root ? this.root : root
    }

    async getstructure() {

        let data = await fetch(this.root + "actions.php?action=getfiles");
        return data.json();


    }

    async openFile(path) {
        console.log(path)
        let data = await fetch(this.root + "actions.php?action=openfile&path=" + encodeURIComponent(path));

        return data.json();


    }




}