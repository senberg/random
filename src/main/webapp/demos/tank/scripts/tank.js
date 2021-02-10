function onLoad() {
    const tank = document.getElementById("tank");
    const acceleration = 0.03;
    const maxSpeed = 2;
    const turnSpeed = 0.015;
    const minx = -400;
    const maxx = 1100;
    const miny = -420;
    const maxy = 520;

    let xPosition = 0;
    let yPosition = 0;
    let speed = 0;
    let direction = 0;
    let forwardKeyPressed = false;
    let reverseKeyPressed = false;
    let leftKeyPressed = false;
    let rightKeyPressed = false;

    const update = () => {
        requestIdleCallback(update);
    
        if (forwardKeyPressed) {
            if (speed < maxSpeed) {
                speed += acceleration;
            }
        } else if (reverseKeyPressed) {
            if (speed > -maxSpeed) {
                speed -= acceleration;
            }
        } else {
            if (speed > acceleration) {
                speed -= acceleration;
            } else if (speed < -acceleration) {
                speed += acceleration;
            } else {
                speed = 0;
            }
        }

        if (leftKeyPressed) {
            direction += turnSpeed;

            if(direction > (Math.PI * 2)){
                direction -= Math.PI * 2;
            }
        } else if (rightKeyPressed) {
            direction -= turnSpeed;

            if(direction < 0){
                direction += Math.PI * 2;
            }
        }

        moveTank();
    };

    const keyHandler = e => {
        let keyPressed = e.type === "keydown";

        if (e.code === "KeyW" || e.code === "ArrowUp") {
            forwardKeyPressed = keyPressed;
        } else if (e.code === "KeyS" || e.code === "ArrowDown") {
            reverseKeyPressed = keyPressed;
        } else if (e.code === "KeyA" || e.code === "ArrowLeft") {
            leftKeyPressed = keyPressed;
        } else if (e.code === "KeyD" || e.code === "ArrowRight") {
            rightKeyPressed = keyPressed;
        }
    };

    function moveTank(){
        let cosDirection = Math.cos(direction);
        let sinDirection = Math.sin(direction);
        let xMovement = speed * sinDirection;
        let yMovement = speed * cosDirection;
        xPosition += xMovement;
        xPosition = Math.max(xPosition, minx);
        xPosition = Math.min(xPosition, maxx);
        yPosition = Math.max(yPosition, miny);
        yPosition = Math.min(yPosition, maxy);
        yPosition += yMovement;

        tank.style.transform = " translate3d(" + xPosition + "px, " + yPosition + "px, -87px) rotateZ(-" + direction + "rad)";
    }

    document.addEventListener("keyup", keyHandler);
    document.addEventListener("keydown", keyHandler);
    update();
}
