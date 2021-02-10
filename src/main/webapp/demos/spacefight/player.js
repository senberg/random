export default class Player{
    constructor(x, y){
        this.positionX = x;
        this.positionY = y;
        this.distance = 0;
        this.speed = 0.2; // pixel per millisecond;
        this.size = 100;
        this.halfSize = this.size / 2;
        this.rotation = 0;
        this.imageRotation = 0.5*Math.PI;
        this.canCollide = true;

        this.element = document.createElement("img");
        this.element.src = "images/player.png";
        this.element.style.position = "absolute";
        this.element.style.width = this.size + "px";
        this.element.style.left = this.positionX - this.halfSize + "px";
        this.element.style.top = this.positionY - this.halfSize + "px";
        document.body.appendChild(this.element);
        document.spaceObjects.add(this);
    }

    update(delta){
        const movement = this.speed * delta;

        if(this.distance > movement){
            this.positionX += this.directionX * movement;
            this.positionY += this.directionY * movement;
            this.distance -= movement;

            this.element.style.left = this.positionX - this.halfSize + "px";
            this.element.style.top = this.positionY - this.halfSize + "px";
        }
    }

    setDestination(x, y){
        this.destinationX = x;
        this.destinationY = y;
        const headingX = this.destinationX - this.positionX;
        const headingY = this.destinationY - this.positionY;
        this.distance = Math.sqrt(headingX * headingX + headingY * headingY);
        this.directionX = headingX / this.distance;
        this.directionY = headingY / this.distance;

        this.rotation = Math.atan2(headingY, headingX);
        let stylingRotation = this.rotation + this.imageRotation;
        this.element.style.transform = "rotate(" + stylingRotation + "rad)"
    }

    collision(){
        alert("You died.");
        location.reload();
    }
}