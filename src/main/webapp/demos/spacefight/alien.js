import Explosion from "./explosion.js";

export default class Alien{
    constructor(){
        this.positionX = Math.random() * window.innerWidth;
        this.positionY = -100;
        const destinationX = Math.random() * window.innerWidth;
        const destinationY = window.innerHeight + 100;
        const headingX = destinationX - this.positionX;
        const headingY = destinationY - this.positionY;
        this.distance = Math.sqrt(headingX * headingX + headingY * headingY);
        this.directionX = headingX / this.distance;
        this.directionY = headingY / this.distance;
        const imageRotation = 0.5*Math.PI;
        this.rotation = Math.atan2(headingY, headingX);
        const rotationStyle = this.rotation + imageRotation;
        this.speed = 0.1; // pixel per millisecond;
        this.size = 50;
        this.halfSize = this.size / 2;
        this.canCollide = true;

        this.element = document.createElement("img");
        this.element.src = "images/alien.png";
        this.element.style.position = "absolute";
        this.element.style.width = this.size + "px";
        this.element.style.left = this.positionX-this.halfSize + "px";
        this.element.style.top = this.positionY-this.halfSize + "px";
        this.element.style.transform = "rotate(" + rotationStyle + "rad)"
        document.body.appendChild(this.element);
        document.spaceObjects.add(this);
    }

    update(delta){
        const movement = this.speed * delta;

        if(this.distance > movement){
            this.positionX += this.directionX * movement;
            this.positionY += this.directionY * movement;
            this.distance -= movement;

            this.element.style.left = this.positionX-this.halfSize + "px";
            this.element.style.top = this.positionY-this.halfSize + "px";
        }
        else{
            this.remove();
        }
    }

    collision(){
        this.remove();
        new Explosion(this);
    }

    remove(){
        document.spaceObjects.delete(this);

        if(this.element.parentElement === document.body){
            document.body.removeChild(this.element);
        }
    }
}