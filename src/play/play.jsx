import React, { use, useState } from "react";
import "./play.css";
import boardFile from "./board.json";

export function Play() {
    const [controlModalOpen, setControlModal] = useState(false);
    const [chatModalOpen, setChatModal] = useState(false);
    const [playerPos, setPlayer] = useState({x: 7, y: 7});

    const grid = new Array(24).fill().map(() => new Array(24).fill(null));
    

    return (
        <main>
            <h1>Play</h1>
            <hr />
            <section id="play-page-layout">
                {/*Section on left for controls/info*/}
                <div id="controls" className={controlModalOpen ? "modal" : ""}>
                    <div className="secret-info">
                        {/*Info section*/}
                        <button id="close-controls" className="large-screen-hidden" onClick={() => setControlModal(false)}></button>
                        <h3>Your Secret Info</h3>
                        <ul>
                            <li>Dr. Tyler is innocent</li>
                            <li>The Syringe was not involved</li>
                            <li>It didn't happen in the Lobby</li>
                            <li>The Reflex Hammer was not involved</li>
                        </ul>
                    </div>
                    <div className="rolling">
                        {/*Dice section*/}
                        <h3>Roll for movement</h3>
                        <p>Moves left: 4<span id="moves-left"></span></p>
                        <button id="dice-roll" className="my-button">Roll Die</button>
                    </div>
                    <div className="guessing">
                        {/*Form for making a guess*/}
                        <form method="dialog" action="play.html">
                            <h3>Make a guess</h3>
                            <div>
                                <label>Player</label>
                                <select>
                                    <option>Dave100</option>
                                    <option>You</option>
                                    <option>Jeremy</option>
                                </select>
                            </div>
                            <div>
                                <label>Room</label>
                                <select>
                                    <option>Clinic</option>
                                    <option>Doctor's Office</option>
                                    <option>Director's Office</option>
                                    <option>Lab</option>
                                    <option>ICU</option>
                                    <option>Operating Room</option>
                                    <option>Lobby</option>
                                    <option>MRI Room</option>
                                </select>
                            </div>
                            <div>
                                <label>Weapon</label>
                                <select>
                                    <option>Stethoscope</option>
                                    <option>Syringe</option>
                                    <option>Reflex Hammer</option>
                                    <option>IV Needle</option>
                                    <option>Pulling the Plug</option>
                                    <option>Latex Gloves</option>
                                    <option>Boredom</option>
                                    <option>Defibrilator</option>
                                </select>
                            </div>
                            <p>
                                <input type="submit" className="my-button" />
                            </p>
                        </form>
                    </div>
                </div>
                {/*Middle section that's a play area*/}
                <div className="player-area">
                    {/*Main playing feature things*/}
                    <Board grid={grid} playerInfo={playerPos} playerUpdate={setPlayer} />
                </div>
                <div className="large-screen-hidden modal-buttons">
                    <button type="button" id="open-controls" onClick={() => setControlModal(!controlModalOpen)}>Open Controls</button>
                    <button type="button" id="open-chat" onClick={() => setChatModal(!chatModalOpen)}>Open Chat</button>
                </div>
                {/*Section on the right, shows live info from others and such*/}
                <div id="chat-box" className={chatModalOpen ? "modal" : ""}>
                    {/*Show the players*/}
                    <div>
                        <button id="close-chat" className="large-screen-hidden" onClick={() => setChatModal(false)}></button>
                        <h3>Players</h3>
                        <ul>
                            <li>Dave100</li>
                            <li>You</li>
                            <li>Jeremy</li>
                        </ul>
                    </div>
                    {/*A place for an info chat*/}
                    <div className="chat-header">
                        <h3>Info Chat</h3>
                    </div>
                    <div id="chat">
                        <div className="chat-message">
                            <p>Jeremy Entered Lobby</p>
                        </div>
                        <div className="chat-message">
                            <p>Dave100 Entered Clinic</p>
                        </div>
                        <div className="chat-message">
                            <p>Jeremy suspected the murderer was:</p>
                            <ul>
                                <li>You</li>
                                <li>In the Clinic</li>
                                <li>With the Syringe</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}

function Board(props) {
    return (
    <div id="board">
        <Rooms roomData={boardFile.rooms} grid={props.grid} />
        <Cells grid={props.grid} playerInfo={props.playerInfo} playerUpdate={props.playerUpdate} />
        <Doors doorData={boardFile.doors} grid={props.grid} />
    </div>
    );
}

/**
 * Loops and generates all the cells to use in the grid
 * @returns The list of cells
 */
function Cells({grid, playerInfo, playerUpdate}) {
    let cells = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if(grid[i][j] == null) {
                let cell = <Cell key={i + "-" + j} i={i} j={j} grid={grid} playerInfo={playerInfo} playerUpdate={playerUpdate} />
                cells.push(cell);
                grid[i][j] = "cell";
            }
        }
    }
    return cells;
}

function Cell(props) {
    const [cellVal, setCellVal] = useState('');
    function moveGuy(i, j) {
        props.playerUpdate({x: i, y: j});
        for(let i = 0; i < props.grid.length; i++) {
            for (let j = 0; j < props.grid[i].length; j++) {
                if (props.grid[i][j] == "p") {
                    props.grid[i][j] = 'cell';
                    break;
                }
            }
        }
        props.grid[i][j] = "p";
        setCellVal('d');
    }
    let onSpace = props.i == props.playerInfo.x && props.j == props.playerInfo.y;
    return <div className="hall" onClick={() => moveGuy(props.i, props.j)} /*style={{ backgroundColor: (onSpace ? "red" : "white") }}*/ >{ onSpace && <Player color={"red"} /> }</div>
}

function Doors({ doorData, grid }) {
    let doors = [];
    doorData.map((door) => {
        grid[door.x - 1][door.y - 1] = door.id;
        let area = door.x + " / " + door.y + " / " + (door.x + 1) + " / " + (door.y + 1);
        doors.push(<div className="door" key={door.id} style={{gridArea: area}}></div>);
    });
    return doors;
}

function Rooms({roomData, grid}) {
    let rooms = [];
    roomData.map((room) => {
        for(let i = room.x; i < room.x + 6; i++) {
            for (let j = room.y; j < room.y + 6; j++) {
                grid[i][j] = room.id;
            }
        }
        rooms.push(<div className={(room.id != "void" ? "room " : "") + room.id} key={room.id}>{room.id != "void" ? room.name : ""}</div>);
    });
    return rooms;
}

function Player({color}) {
    return (
        <div className="player" style={{backgroundColor: color}}></div>
    );
}