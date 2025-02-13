import React, { use, useState } from "react";
import "./play.css";
import boardFile from "./board.json";

export function Play() {
    const [controlModalOpen, setControlModal] = useState(false);
    const [chatModalOpen, setChatModal] = useState(false);
    const [players, setPlayers] = useState([
        {
            x: 7,
            y: 7, 
            color: 'green',
            disabled: '#c4ffc4',
            currentRoom: null, 
            moves: 0, 
            turn: true, 
            recentArrival: false,
            name: "You"
        },
        {
            x: 18,
            y: 7, 
            color: 'blue', 
            disabled: '#c7c7ff',
            currentRoom: null, 
            moves: 0, 
            turn: true, 
            recentArrival: false,
            name: "Jeremy"
        },
        {
            x: 7,
            y: 18, 
            color: 'red',
            disabled: '#ffa8a8',
            currentRoom: null, 
            moves: 0, 
            turn: true, 
            recentArrival: false,
            name: "Dave100"
        }
    ]);
    const [playerTurn, setTurn] = useState(0);
    const [chatlog, setChat] = useState([
        {
            type: "line",
            message: "Welcome to Medical Murder Mystery!",
        },
        {
            type: "guess",
            guesser: "You",
            person: "Jeremy",
            room: "Clinic",
            weapon: "Syringe"
        }
    ]);

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
                        <p>Moves left: {players[playerTurn].moves}</p>
                        <button id="dice-roll" className="my-button" disabled={players[playerTurn].recentArrival || players[playerTurn].moves > 0} onClick={() => {
                            let tempPlayers = JSON.parse(JSON.stringify(players));
                            tempPlayers[playerTurn].moves = Math.ceil(Math.random() * 6);
                            setPlayers(tempPlayers);
                        }} >Roll Die</button>
                    </div>
                    <div className="guessing">
                        {/*Form for making a guess*/}
                        <form method="dialog" action="play.html" onSubmit={(event) => {
                            console.log(event.target.playerChoice.value);
                            console.log(event.target.weaponChoice.value);
                            let tempPlayers = JSON.parse(JSON.stringify(players));
                            tempPlayers[playerTurn].recentArrival = false;
                            tempPlayers[playerTurn].turn = false;
                            setTurn((playerTurn + 1) % players.length);
                            setPlayers(tempPlayers);
                        }}>
                            <h3>Make a guess</h3>
                            <fieldset disabled={players[playerTurn].currentRoom == null || !players[playerTurn].recentArrival}>
                                <div>
                                    <label>Player</label>
                                    <select name="playerChoice">
                                        <option>Dave100</option>
                                        <option>You</option>
                                        <option>Jeremy</option>
                                    </select>
                                </div>
                                {/* I realized I needed to remove this because that's not how clue works.
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
                                </div>*/}
                                <div>
                                    <label>Weapon</label>
                                    <select name="weaponChoice">
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
                                    <input type="submit" className="my-button"/>
                                </p>
                            </fieldset>
                        </form>
                    </div>
                </div>
                {/*Middle section that's a play area*/}
                <div className="player-area">
                    {/*Main playing feature things*/}
                    <Board 
                        grid={grid}
                        playerInfo={players}
                        playerUpdate={setPlayers}
                        turn={playerTurn}
                        setTurn={setTurn}
                    />
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
                    <Chat chatlog={chatlog} />
                </div>
            </section>
        </main>
    );
}

function Board(props) {
    return (
    <div id="board">
        <Rooms roomData={boardFile.rooms} grid={props.grid} />
        <Cells 
            grid={props.grid}
            playerInfo={props.playerInfo}
            playerUpdate={props.playerUpdate}
            turn={props.turn}
            setTurn={props.setTurn}
        />
        <Doors
            doorData={boardFile.doors}
            grid={props.grid}
            playerInfo={props.playerInfo}
            playerUpdate={props.playerUpdate}
            turn={props.turn}
            setTurn={props.setTurn}
        />
    </div>
    );
}

/**
 * Loops and generates all the cells to use in the grid
 * @returns The list of cells
 */
function Cells({grid, playerInfo, playerUpdate, turn, setTurn}) {
    let cells = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if(grid[i][j] == null) {
                let cell = <Cell key={i + "-" + j} i={i} j={j} playerInfo={playerInfo} playerUpdate={playerUpdate} turn={turn} setTurn={setTurn} />
                cells.push(cell);
                grid[i][j] = "cell";
            }
        }
    }
    return cells;
}

function Cell(props) {
    function moveGuy(i, j) {
        let tempPlayers = JSON.parse(JSON.stringify(props.playerInfo));
        if(Math.abs(i - tempPlayers[props.turn].x) + Math.abs(j - tempPlayers[props.turn].y) == 1 && tempPlayers[props.turn].moves > 0) {
            
            tempPlayers[props.turn].x = i;
            tempPlayers[props.turn].y = j;
            tempPlayers[props.turn].currentRoom = null;
            tempPlayers[props.turn].moves--;
            // end turn if no more moves
            if(tempPlayers[props.turn].moves < 1) {
                tempPlayers[props.turn].turn = false;
                props.setTurn((props.turn + 1) % tempPlayers.length);
            }
            props.playerUpdate(tempPlayers);
        }
    }
    let playerOn = -1;
    for (let i = 0; i < props.playerInfo.length; i++) {
        if(props.playerInfo[i].x == props.i && props.playerInfo[i].y == props.j) {
            playerOn = i;
        }
    }
    return <div className="hall" onClick={() => moveGuy(props.i, props.j)} >
        { playerOn >= 0 && <Player color={playerOn == props.turn ? props.playerInfo[playerOn].color : props.playerInfo[playerOn].disabled} /> }
    </div>
}

function Doors({ doorData, grid, playerInfo, playerUpdate, turn, setTurn }) {
    let doors = [];
    doorData.map((door) => {
        grid[door.x - 1][door.y - 1] = door.id;
        let area = door.x + " / " + door.y + " / " + (door.x + 1) + " / " + (door.y + 1);
        doors.push(<Door 
            key={door.id} 
            doorID={door.id} 
            i={door.x - 1} 
            j={door.y - 1} 
            playerInfo={playerInfo} 
            playerUpdate={playerUpdate} 
            area={{gridArea: area}} 
            turn={turn}
            setTurn={setTurn}
        />);
    });
    return doors;
}

function Door(props) {
    function moveGuy(i, j) {
        let tempPlayers = JSON.parse(JSON.stringify(props.playerInfo));
        // check that the space is only one away
        if(Math.abs(i - tempPlayers[props.turn].x) + Math.abs(j - tempPlayers[props.turn].y) == 1 && tempPlayers[props.turn].moves > 0) {
            tempPlayers[props.turn].x = i;
            tempPlayers[props.turn].y = j;
            tempPlayers[props.turn].currentRoom = props.doorID;
            tempPlayers[props.turn].moves = 0;
            tempPlayers[props.turn].recentArrival = true;
            props.playerUpdate(tempPlayers);
        }
    }
    let playerOn = -1;
    for (let i = 0; i < props.playerInfo.length; i++) {
        if(props.playerInfo[i].x == props.i && props.playerInfo[i].y == props.j) {
            playerOn = i;
        }
    }
    if (playerOn >= 0)
        console.log(props.playerInfo[props.turn]);
    return <div className="door" style={props.area} onClick={() => moveGuy(props.i, props.j)} >
            { playerOn >= 0 && <Player color={playerOn == props.turn ? props.playerInfo[playerOn].color : props.playerInfo[playerOn].disabled} /> }
        </div>
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
        <div className="player" style={{backgroundColor: color}} ></div>
    );
}

function Chat({chatlog}) {
    console.log(chatlog);
    return (
        <div id="chat">
        {chatlog.map((msg, index) => {
            return (<div key={index} className="chat-message">
                <Message msg={msg} />
            </div>)
        })}
        </div>
    
    );
}

function Message({msg}) {
    if(msg.type == "line") {
        return <p>{msg.message}</p>
    }
    else if (msg.type == "guess") {
        return (
        <>
            <p>{msg.guesser + " guessed:"}</p>
            <ul>
                <li>{"It was " + msg.person}</li>
                <li>{"In " + msg.room}</li>
                <li>{"With the " + msg.weapon}</li>
            </ul>
        </>
        );
    }
}