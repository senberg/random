export default class Status{
    constructor(){
        this.element = document.createElement("div");
        this.element.style.border = "2px solid blue";
        this.element.style.fontSize = "24px";
        this.element.style.color = "blue";
        this.element.style.padding = "10px";
        this.element.style.position = "absolute";
        this.element.style.bottom = "20px";
        this.element.style.left = "20px";
        this.element.style.zIndex = "1";
        this.canCollide = false;
        document.body.appendChild(this.element);
        document.spaceObjects.add(this);
    }

    update(delta){
        this.element.textContent = "Space things: " + document.spaceObjects.size;
    }
}