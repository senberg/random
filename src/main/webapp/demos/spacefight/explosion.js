export default class Explosion{
    constructor(source){
        this.positionX = source.positionX;
        this.positionY = source.positionY;
        this.size = 100;
        this.halfSize = this.size / 2;
        this.opacity = 1;
        this.fadeSpeed = 0.005; // percent fade per millisecond
        this.canCollide = false;
        let stylingRotation = source.rotation;

        this.element = document.createElement("img");
        this.element.src = "images/explosion.png";
        this.element.style.position = "absolute";
        this.element.style.width = this.size + "px";
        this.element.style.transform = "rotate(" + stylingRotation + "rad)";
        this.element.style.left = this.positionX-this.halfSize + "px";
        this.element.style.top = this.positionY-this.halfSize + "px";
        document.body.appendChild(this.element);
        document.spaceObjects.add(this);
    }

    update(delta){
        let fade = delta * this.fadeSpeed;

        if(this.opacity > fade){
            this.opacity -= fade;
            this.element.style.opacity = this.opacity;
        }
        else{
            this.remove();
        }
    }

    remove(){
        document.spaceObjects.delete(this);

        if(this.element.parentElement === document.body){
            document.body.removeChild(this.element);
        }
    }
}