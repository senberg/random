export default class Background{
    constructor(){
        document.body.style.background = "url(images/background.png)"
        this.position = 0;
        this.speed = 0.05; // pixel per millisecond
        this.canCollide = false;
        document.spaceObjects.add(this);
    }

    update(delta){
        this.position += delta * this.speed;
        document.body.style.backgroundPosition = "0px " + this.position + "px";
    }
}