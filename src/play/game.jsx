import React, { use, useRef, useState, useEffect } from "react";
import "./game.css";
import boardFile from "./datafiles/board.json";
import GuessingForm from "./guessing";
import clueData from "./datafiles/clueData.json";
import { webSocket } from './webSocketHandler';

export function Game(props) {
    const [controlModalOpen, setControlModal] = useState(false);
    const [chatModalOpen, setChatModal] = useState(false);
    // set up players, will be automatically based on number of players connected
    const players = props.players;
    // set up function
    function setPlayers(val) {
        props.setPlayers(val);
    }
    const turn = props.turn;
    const setTurn = props.setTurn;
    // set up the chat for displaying info
    const chatlog = props.chatlog;
    const setChat = props.setChat;
    const intel = props.intel;
    const setIntel = props.setIntel;

    // this represents which index of the players array the user of this device is
    const [playerTurn, setPlayerTurn] = useState(props.playerIndex);

    // use this to add to intel to prevent duplication
    function addIntel(newIntel) {
        setIntel(newIntel);
    }

    const intervalRef = useRef(null);

    // interval to retrieve location data from server
    useEffect(() => {
        // function that updates the player's position
        webSocket.updatePos = data => {
            if (data.found) {
                if (data.winner >= 0) {
                    props.setWinner(players[data.winner]);
                }
                setTurn(data.turn);
                setPlayerTurn(data.playerIndex);
                setPlayers(players => {
                    let tempPlayers = JSON.parse(JSON.stringify(players));
                    data.players.forEach((player, index) => {
                        tempPlayers[index].x = player.x;
                        tempPlayers[index].y = player.y;
                    });
                    return tempPlayers;
                });
                setChat(data.chatlog);
            }
        };
        webSocket.updateChat = data => {
            setChat(data.chatlog);
        };
    }, []);

    // the grid to track what each place on the map should be, a little messy
    const grid = new Array(24).fill().map(() => new Array(24).fill(null));
    return (
        <>
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
                            {Object.keys(intel).map((key, index) => (
                                <li key={index}>{(intel[key] ? "Correct: " : "Incorrect: ") + (key in clueData.allKeys ? clueData.allKeys[key] : key)}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rolling">
                        {/*Dice section*/}
                        <h3>Roll for movement</h3>
                        <p>Moves left: {players[playerTurn].moves}</p>
                        <button id="dice-roll" className="my-button" disabled={playerTurn != turn || players[turn].recentArrival || players[playerTurn].moves > 0} onClick={() => {
                            let tempPlayers = JSON.parse(JSON.stringify(players));
                            tempPlayers[turn].moves = rollDice();
                            setPlayers(tempPlayers);
                        }} >Roll Die</button>
                    </div>
                    <div className="guessing">
                        {/*Form for making a guess*/}
                        <GuessingForm
                            players={players}
                            playerTurn={playerTurn}
                            turn={turn}
                            setTurn={setTurn}
                            chatlog={chatlog}
                            setChat={setChat}
                            setPlayers={setPlayers}
                            addIntel={addIntel}
                            setWinner={props.setWinner}
                            gameID={props.gameID}
                        />
                    </div>
                </div>
                {/*Middle section that's a play area*/}
                <div className="player-area">
                    {/*Main playing feature things*/}
                    <Board
                        grid={grid}
                        players={players}
                        setPlayers={setPlayers}
                        turn={turn}
                        setTurn={setTurn}
                        chatlog={chatlog}
                        setChat={setChat}
                        gameID={props.gameID}
                        playerTurn={playerTurn}
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
                            {players.map(player => (
                                <li key={player.name}>{player.name}<span className="player-dot" style={{ backgroundColor: player.color }}></span></li>
                            ))}
                        </ul>
                    </div>
                    {/*A place for an info chat*/}
                    <div className="chat-header">
                        <h3>Info Chat</h3>
                    </div>
                    <Chat chatlog={chatlog} />
                </div>
            </section>
        </>
    );
}

function Board(props) {
    return (
        <div id="board">
            <Rooms roomData={boardFile.rooms} grid={props.grid} />
            <Cells
                grid={props.grid}
                players={props.players}
                setPlayers={props.setPlayers}
                turn={props.turn}
                setTurn={props.setTurn}
                chatlog={props.chatlog}
                setChat={props.setChat}
                gameID={props.gameID}
                playerTurn={props.playerTurn}
            />
            <Doors
                doorData={boardFile.doors}
                grid={props.grid}
                players={props.players}
                setPlayers={props.setPlayers}
                turn={props.turn}
                setTurn={props.setTurn}
                chatlog={props.chatlog}
                setChat={props.setChat}
                gameID={props.gameID}
                playerTurn={props.playerTurn}
            />
        </div>
    );
}

/**
 * Loops and generates all the cells to use in the grid
 * @returns The list of cells
 */
function Cells(props) {
    let cells = [];
    // loop and add cells with correct coordinates
    for (let i = 0; i < props.grid.length; i++) {
        for (let j = 0; j < props.grid[i].length; j++) {
            if (props.grid[i][j] == null) {
                let cell = <Cell
                    key={i + "-" + j}
                    i={i}
                    j={j}
                    players={props.players}
                    setPlayers={props.setPlayers}
                    turn={props.turn}
                    setTurn={props.setTurn}
                    chatlog={props.chatlog}
                    setChat={props.setChat}
                    gameID={props.gameID}
                    playerTurn={props.playerTurn}
                />
                // now grid displays
                cells.push(cell);
            }
        }
    }
    return cells;
}

function Cell(props) {
    function moveGuy(i, j) {
        let tempPlayers = JSON.parse(JSON.stringify(props.players));
        // if selected spot within one step, move there
        if (Math.abs(i - tempPlayers[props.playerTurn].x) + Math.abs(j - tempPlayers[props.playerTurn].y) == 1 && tempPlayers[props.playerTurn].moves > 0) {
            // set everything to new position
            tempPlayers[props.turn].x = i;
            tempPlayers[props.turn].y = j;
            tempPlayers[props.turn].currentRoom = null;
            tempPlayers[props.turn].moves--;
            let nextTurn = props.turn;
            // end turn if no more moves
            if (tempPlayers[props.turn].moves < 1) {
                tempPlayers[props.turn].turn = false;
                nextTurn = (props.turn + 1) % tempPlayers.length;
                props.setTurn(nextTurn);
                let newChat = { type: "line", message: (tempPlayers[nextTurn].name) + "'s turn" };
                webSocket.sendChat(props.gameID, newChat);
            }
            updatePos(i, j, props.turn, props.gameID, nextTurn, tempPlayers[props.turn].moves, null, false, tempPlayers[props.turn].name);
            props.setPlayers(tempPlayers);
        }
    }
    // figure out if there is a player on this square
    let playerOn = -1;
    for (let i = 0; i < props.players.length; i++) {
        if (props.players[i].x == props.i && props.players[i].y == props.j) {
            playerOn = i;
        }
    }
    return <div className="hall" onClick={() => moveGuy(props.i, props.j)} >
        {playerOn >= 0 && <PlayerDisplay color={playerOn == props.turn ? props.players[playerOn].color : props.players[playerOn].disabled} />}
    </div>
}

function Doors(props) {
    let doors = [];
    // loop through door data and add to grid/render
    props.doorData.map((door) => {
        props.grid[door.x - 1][door.y - 1] = door.id;
        // define the correct spot for the door to reside
        let area = door.x + " / " + door.y + " / " + (door.x + 1) + " / " + (door.y + 1);
        doors.push(<Door
            key={door.id}
            doorID={door.id}
            i={door.x - 1}
            j={door.y - 1}
            players={props.players}
            setPlayers={props.setPlayers}
            area={{ gridArea: area }}
            turn={props.turn}
            setTurn={props.setTurn}
            chatlog={props.chatlog}
            setChat={props.setChat}
            roomId={door.roomId}
            gameID={props.gameID}
            playerTurn={props.playerTurn}
        />);
    });
    return doors;
}

function Door(props) {
    function moveGuy(i, j) {
        let tempPlayers = JSON.parse(JSON.stringify(props.players));
        // check that the space is only one away
        if (Math.abs(i - tempPlayers[props.playerTurn].x) + Math.abs(j - tempPlayers[props.playerTurn].y) == 1 && tempPlayers[props.playerTurn].moves > 0) {
            // set player to new position
            tempPlayers[props.turn].x = i;
            tempPlayers[props.turn].y = j;
            tempPlayers[props.turn].currentRoom = props.roomId;
            tempPlayers[props.turn].moves = 0;
            tempPlayers[props.turn].recentArrival = true;
            let newChat = { type: "line", message: (tempPlayers[props.turn].name) + " just entered " + clueData.roomIdNames[props.roomId] };
            // send chat with websocket
            webSocket.sendChat(props.gameID, newChat);
            props.setPlayers(tempPlayers);
            updatePos(i, j, props.turn, props.gameID, props.turn, 0, props.roomId, true, tempPlayers[props.turn].name);
        }
    }
    // determine if a player is on this door
    let playerOn = -1;
    for (let i = 0; i < props.players.length; i++) {
        if (props.players[i].x == props.i && props.players[i].y == props.j) {
            playerOn = i;
        }
    }
    return <div className="door" style={props.area} onClick={() => moveGuy(props.i, props.j)} >
        {playerOn >= 0 && <PlayerDisplay color={playerOn == props.turn ? props.players[playerOn].color : props.players[playerOn].disabled} />}
    </div>
}

function Rooms({ roomData, grid }) {
    // use the room data render these rooms
    let rooms = [];
    roomData.map((room) => {
        for (let i = room.x; i < room.x + 6; i++) {
            for (let j = room.y; j < room.y + 6; j++) {
                grid[i][j] = room.id;
            }
        }
        rooms.push(<div className={(room.id != "void" ? "room " : "") + room.id} key={room.id}>{room.id != "void" ? room.name : ""}</div>);
    });
    return rooms;
}

/// Renders a player with a certain color
function PlayerDisplay({ color }) {
    return (
        <div className="player" style={{ backgroundColor: color }} ></div>
    );
}

// Dynamically renders a the chat with the chatlog
function Chat({ chatlog }) {
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

// Renders a single message for the chat
function Message({ msg }) {
    if (msg.type == "line") {
        return <p>{msg.message}</p>
    }
    else if (msg.type == "guess") {
        return (
            <>
                <p>{msg.guesser + " guessed:"}</p>
                <ul>
                    <li>{"It was " + msg.person}</li>
                    <li>{"In " + clueData.roomIdNames[msg.room]}</li>
                    <li>{"With the " + clueData.weaponIdNames[msg.weapon]}</li>
                </ul>
            </>
        );
    }
}

// represents a 3rd party API (if I end up actually using it)
function rollDice() {
    return Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6);
}

// function to update the position of the player on server-side
function updatePos(x, y, index, lobbyID, turn, moves, currentRoom, recentArrival, playerName) {
    webSocket.sendPosition(index, x, y, moves, turn, currentRoom, recentArrival, lobbyID, playerName);
}