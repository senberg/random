"use strict";

const CARD_NAMES = ["Black Lotus", "Ancestral Recall", "Time Walk", "Timetwister", "Mox Pearl", "Mox Jet", "Mox Sapphire", "Mox Ruby", "Mox Emerald"];

function startNewGame() {
    // Add new cards, two per type
    let cards = new Array(CARD_NAMES.length * 2);

    for(let i = 0; i<CARD_NAMES.length; i++){
        cards[i*2] = CARD_NAMES[i];
        cards[i*2 + 1] = CARD_NAMES[i];
    }

    cards.shuffle();

    // Create html cards
    let table = document.getElementById("cardTable");

    for(let card = 0, row = 0; row<3; row++){
        let row = document.createElement("tr");
        table.appendChild(row);

        for(let cell=0; cell<6; cell++){
            let cardName = cards[card++];

            let cell = document.createElement("td");
            cell.classList.add("flipbox-outer");
            cell.classList.add("selectable");
            cell.onclick = selectCard;
            cell.dataset.name = cardName;
            row.appendChild(cell);

            let flipbox = document.createElement("div");
            flipbox.classList.add("flipbox-inner");
            cell.appendChild(flipbox);

            let back = document.createElement("IMG");
            back.classList.add("back");
            back.src = "images/Backside.jpg";
            back.draggable = false;
            flipbox.appendChild(back);

            let front = document.createElement("IMG");
            front.classList.add("front");
            front.src = "images/" + cardName + ".jpg";
            front.draggable = false;
            flipbox.appendChild(front);
        }
    }
}

function selectCard(){
    if(this.classList.contains("selectable")){
        let selected = document.getElementById("selected");

        if(selected == null){
            clearAnimations();
            this.id = "selected";
            this.classList.remove("selectable");
            this.classList.add("reveal");
        }
        else {
            if(this.dataset.name == selected.dataset.name){
                this.classList.remove("selectable");
                this.classList.add("done");
                selected.classList.remove("reveal");
                selected.classList.add("done");
            }
            else{
                this.classList.add("temporary-reveal");
                selected.classList.add("selectable");
                selected.classList.remove("reveal");
                selected.classList.add("hide");
            }

            selected.removeAttribute("id");
        }

        checkWinCondition();
    }
}

function clearAnimations(){
    let temporaryReveals = document.getElementsByClassName("temporary-reveal");

    while(temporaryReveals.length){
        temporaryReveals[0].classList.remove("temporary-reveal");
    }

    let hidden = document.getElementsByClassName("hide");

    while(hidden.length){
        hidden[0].classList.remove("hide");
    }
}

function checkWinCondition(){
    if(document.getElementsByClassName("done").length == 18){
        document.getElementById("win").style.display = "inherit";
    }
}

Array.prototype.shuffle = function shuffle() {
    for(let i = this.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        const temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
}