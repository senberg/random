export default class Laser{
    constructor(source){
        this.positionX = source.positionX;
        this.positionY = source.positionY;
        this.directionX = Math.cos(source.rotation);
        this.directionY = Math.sin(source.rotation);
        this.speed = 2; // pixel per millisecond;
        this.size = 60;
        this.halfSize = this.size / 2;
        this.distance = 1000;
        this.canCollide = true;
        let imageRotation = 0.785*Math.PI;
        let stylingRotation = source.rotation + imageRotation;

        this.element = document.createElement("img");
        this.element.src = "images/laser.png";
        this.element.style.position = "absolute";
        this.element.style.width = this.size + "px";
        this.element.style.transform = "rotate(" + stylingRotation + "rad)";
        document.body.appendChild(this.element);

        let minDistance = source.halfSize + this.halfSize;
        this.update(minDistance/this.speed);
        document.spaceObjects.add(this);
    }

    update(delta){
        let movement = this.speed * delta;

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
        document.score++;
    }

    remove(){
        document.spaceObjects.delete(this);

        if(this.element.parentElement === document.body){
            document.body.removeChild(this.element);
        }
    }
}