"use strict";
const enemyMinX = -100
const enemyMaxX = 1275;
const enemyMinY = 0
const enemyMaxY = 900;
const travelTime = 5000;
const maxSpawns = 100;

let gameActive = false;
let spawnInterval;
let spawns;
let score;
let highscore = 0;

function pageLoaded() {
}

function startGame(){
    let enemies = document.getElementsByClassName("enemy");

    while(enemies.length){
        enemies[0].parentNode.removeChild(enemies[0]);
    }

    document.getElementById("startGameButton").style.display = "none";
    document.getElementById("missionFailure").style.display = "none";
    document.getElementById("shootEnemies").style.display = "inherit";

    updateScore(0)
    spawnInterval = 3000;
    gameActive = true;
    spawns = 0;
    spawnEnemy();
    window.requestAnimationFrame(update);
}

function spawnEnemy(){
    if(gameActive && spawns < maxSpawns){
        spawns++;
        let playingField = document.getElementById("playingField");
        let enemy = document.createElement("image");
        enemy.src = "images/enemy.png";
        enemy.style.top = "0px";
        let xPosition = Math.floor(enemyMinX + Math.random() * (enemyMaxX-enemyMinX));
        enemy.style.left = xPosition + "px";
        enemy.classList.add("enemy");
        enemy.onclick = shootEnemy;
        enemy.dataset.spawnTime = performance.now();
        enemy.draggable = false;
        playingField.appendChild(enemy);

        // Spawn enemies faster and faster
        spawnInterval = spawnInterval * 0.95;
        setTimeout(spawnEnemy, spawnInterval);
    }
}

function update(timestamp){
    let enemies = document.getElementsByClassName("enemy");

    for(let i=0; i<enemies.length; i++){
        let enemy = enemies[i];
        let enemyDuration = performance.now() - enemy.dataset.spawnTime;

        if(enemyDuration < travelTime){
            let percentageTravel = enemyDuration / travelTime;
            let yPosition = Math.floor(enemyMinY + percentageTravel * (enemyMaxY-enemyMinY));
            enemy.style.top = yPosition + "px";
        }
        else{
            gameActive = false;
            updateHighscore();
            document.getElementById("startGameButton").style.display = "inline-block";
            document.getElementById("shootEnemies").style.display = "none";
            document.getElementById("missionFailure").style.display = "inherit";
            return;
        }
    }

    requestAnimationFrame(update);
}

function shootEnemy(){
    if(gameActive){
        this.parentNode.removeChild(this);
        updateScore(score + 1);
        checkWinCondition();
    }
}

function updateScore(newScore){
    score = newScore;
    document.getElementById("scoreLabel").innerHTML = score;
}

function updateHighscore(){
    if(score > highscore){
        highscore = score
        document.getElementById("highscoreLabel").innerHTML = highscore;
    }
}

function checkWinCondition(){
    if(score == maxSpawns){
        gameActive = false;
        updateHighscore();
        document.getElementById("shootEnemies").style.display = "none";
        document.getElementById("gameWin").style.display = "inherit";
    }
}