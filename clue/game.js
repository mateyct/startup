"use strict";

// 1. loop through and add rooms (x)
//      - make sure to check for the void square (x)
//      - add all the squares to a 2D array
// 2. calculate remaining area and add squares
let board = document.getElementById("board");
fetch("./dataFiles/rooms.json")
    .then((response) => response.json())
    .then((json) => {
        let boardArr = [];
        
        json.rooms.forEach(element => {
            let room = document.createElement("div");
            if ("void" in element) {
                room.classList.add("void");
            }
            else {
                room.classList.add(element.name, "room");
                room.textContent = element.displayName;
                // also make it have correct styling
                room.style.gridColumn = element.posX + "/" + (element.posX + 6);
                room.style.gridRow = element.posY + "/" + (element.posY + 6);
                if ("doors" in element) {
                    element.doors.forEach(doorData => {
                        let door = document.createElement("div");
                        door.className = "door";
                        let xPos = element.posX + doorData.x;
                        let yPos = element.posY + doorData.y;
                        door.style.gridColumn = xPos + " / " + (xPos + 1);
                        door.style.gridRow = yPos + " / " + (yPos + 1);
                        board.appendChild(door);
                    });
                }
            }
            board.appendChild(room);
        });
        // calculate remaining space
        let totalSpace = 24 * 24;
        let roomSpace = 6 * 6;
        let takenSpace = roomSpace * 9;
        let emptySpace = totalSpace - takenSpace;
        for (let i = 0; i < emptySpace; i++) {
            let newCell = document.createElement("div");
            newCell.classList.add("hall");
            board.appendChild(newCell);
        }
    });