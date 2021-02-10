import Status from "./status.js";
import Score from "./score.js";
import Background from "./background.js";
import Player from "./player.js";
import Laser from "./laser.js";
import Alien from "./alien.js";

document.spaceObjects = new Set();
new Status();
new Score();
new Background();
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
const player = new Player(centerX, centerY);

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('click', onMouseClick);
document.addEventListener('contextmenu', onMouseClick);

let startTime = performance.now();
requestAnimationFrame(update);
let spawnInterval = 2000;
setTimeout(spawnAlien, spawnInterval);

function update(){
    let delta = performance.now() - startTime;

    for(const object of document.spaceObjects){
        object.update(delta);
    }

    checkCollisions();

    startTime += delta;
    requestAnimationFrame(update);
}

function onMouseMove(event){
    player.setDestination(event.clientX, event.clientY);
}

function onMouseClick(event){
    if(event.button == 0){
        new Laser(player);
    }
    else if(event.button == 2){
    }

    event.preventDefault();
}

function spawnAlien(){
    new Alien();
    spawnInterval *= 0.9;
    setTimeout(spawnAlien, spawnInterval);
}

function checkCollisions(){
    for(let firstObject of document.spaceObjects){
        for(let secondObject of document.spaceObjects){
            if(firstObject !== secondObject && firstObject.canCollide && secondObject.canCollide){
                const xDistance = firstObject.positionX - secondObject.positionX;
                const yDistance = firstObject.positionY - secondObject.positionY;
                const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

                if(distance < firstObject.halfSize + secondObject.halfSize){
                    firstObject.collision();
                    secondObject.collision();
                }
            }
        }
    }
}