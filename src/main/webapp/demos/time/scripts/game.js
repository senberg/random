"use strict";

const hexagonPoints = [{x:152,y:2}, {x:52,y:5}, {x:2,y:89}, {x:52,y:176}, {x:152,y:176}, {x:202,y:89}];
const hexagonOffsetX = 155;
const hexagonOffsetY = 90;

function onLoad() {
    let plane = document.getElementById("plane");
    let hexagonArea = document.createElement("svg");

    for(let row = 0; row<1; row++){
        for(let column=0; column<1; column++){
            let hexagon = document.createElement("polygon");
            hexagon.classList.add("hexagon");
            hexagon.setAttribute("points", "152,2 52,2 2,89 52,176 152,176 202,89");
            hexagonArea.appendChild(hexagon);
        }
    }

    plane.appendChild(hexagonArea);
}
