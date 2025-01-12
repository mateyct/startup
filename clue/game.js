"use strict";

// 1. loop through and add rooms (x)
//      - make sure to check for the void square (x)
//      - add all the squares to a 2D array
// 2. calculate remaining area and add squares
let board = document.getElementById("board");
let boardArr = new Array(24).fill().map(() => new Array(24).fill(0));


// retrieve rooms.json and set up board completely
fetch("./dataFiles/rooms.json")
    .then((response) => response.json())
    .then((json) => {
        // make a new array filled with 0s. 0s make it easier to fill with blanks later
        //let boardArr = 
        json.rooms.forEach(element => {
            let room = document.createElement("div");
            if ("void" in element) {
                room.classList.add("void");
            }
            else {
                room.classList.add(element.name, "room");
                room.textContent = element.displayName;
            }
            // also make it have correct styling
            room.style.gridColumn = element.posX + "/" + (element.posX + 6);
            room.style.gridRow = element.posY + "/" + (element.posY + 6);
            // loop to fill up my nice array! (boardArr)
            for (let i = element.posX - 1; i < element.posX + 5; i++) {
                for (let j = element.posY - 1; j < element.posY + 5; j ++) {
                    boardArr[j][i] = room;
                }
            }
            if ("doors" in element) {
                element.doors.forEach(doorData => {
                    let door = document.createElement("div");
                    door.className = "door";
                    let xPos = element.posX + doorData.x;
                    let yPos = element.posY + doorData.y;
                    door.style.gridColumn = xPos + " / " + (xPos + 1);
                    door.style.gridRow = yPos + " / " + (yPos + 1);
                    boardArr[yPos - 1][xPos - 1] = door;
                    door.addEventListener("mousedown", (e) => {
                        // stop event from propogating
                        if (door.childElementCount > 0) {
                            return;
                        }
                        let player = document.createElement("div");
                        player.classList.add("player-red");
                        e.target.appendChild(player);
                    });
                    board.appendChild(door);
                });
            }
            board.appendChild(room);
        });
        // calculate remaining space
        for (let i = 0; i < boardArr.length; i++) {
            for (let j = 0; j < boardArr[i].length; j++) {
                if (boardArr[i][j] == 0) {
                    let newCell = document.createElement("div");
                    newCell.classList.add("hall");
                    newCell.addEventListener("mousedown", (e) => {
                        let player = document.createElement("div");
                        player.classList.add("player-red");
                        e.target.appendChild(player);
                    });
                    boardArr[i][j] = newCell;
                    board.appendChild(newCell);
                }
            }
        }
        
    });
