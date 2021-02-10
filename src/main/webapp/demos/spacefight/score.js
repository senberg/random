export default class Status{
    constructor(){
        document.score = 0;
        this.element = document.createElement("div");
        this.element.style.fontSize = "50px";
        this.element.style.color = "red";
        this.element.style.position = "absolute";
        this.element.style.top = "50px";
        this.element.style.right = "50px";
        this.element.style.zIndex = "1";
        this.canCollide = false;
        this.element.style.fontFamily = "'Russo One', sans-serif";
        document.body.appendChild(this.element);
        document.spaceObjects.add(this);
    }

    update(delta){
        this.element.textContent = String(document.score).padStart(6, "0");
    }
}