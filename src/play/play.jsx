import React, { use, useState } from "react";
import { Game } from "./game";
import './play.css';
import { Player } from "./player";

export function Play(props) {
    const [gameID, setGameID] = useState('');
    const [inGame, setInGame] = useState(false);
    // rooms here represents different instances of the game
    const [rooms, setRooms] = useState([13232]);
    // players that are used
    const [players, setPlayers] = useState([new Player(7, 0, 'yellow', '#FFFFC5', null, 0, true, false, props.userName)]);
    /*
    order of making a game
        - one page displaying "Create room" or "Join room" (look into setInterval for rooms being created)
            - shows rooms that can be joined
        - lobby or waiting room once joined
            - has "start game option"
        - goes to the game once clicked
    */
    return (
        <main>
            {!gameID && <Join gameID={gameID} setGameID={setGameID} rooms={rooms} setRooms={setRooms} />}
            {gameID && !inGame && <GameLobby gameID={gameID} inGame={inGame} setInGame={setInGame} userName={props.userName} players={players} setPlayers={setPlayers} />}
            {gameID && inGame && <Game gameID={gameID} players={players} setPlayers={setPlayers} />}
        </main>
    );
}

function Join(props) {
    const [intervalSet, setIntervalSet] = useState(false); // this is pretty temporary
    // use a set interval to represent a WebSocket
    if (!intervalSet) {
        let counter = 0;
        let interv = setInterval(() => {
            counter++;
            props.setRooms((prev) => [...prev, Math.round(Math.random() * 100000)])
            if (counter >= 5) {
                clearInterval(interv);
            }
        }, 5000);
        setIntervalSet(true);
    }
    // function that creates a new room
    function createRoom() {
        let randomID = Math.round(Math.random() * 100000);
        props.setGameID(randomID);
    }
    // function to join a game
    function joinRoom(id) {
        props.setGameID(id);
    }
    return (
        <>
            <h2>Join a game</h2>
            <div className="join-room">
                <button className="my-button" onClick={createRoom}>Create Room</button>
                <div className="available-rooms">
                    {props.rooms.map(room => (
                        <div key={room} className="room-join-option" onClick={() => joinRoom(room)}>{room}</div>
                    ))}
                </div>
            </div>
        </>
    )
}

function GameLobby(props) {
    const [intervalSet, setIntervalSet] = useState(false); // this is pretty temporary
    const [counter, setCounter] = useState(0); // also should be temporary
    // also have player options
    const playerOptions = [
        new Player(7, 7, 'green', '#c4ffc4', null, 0, true, false, "Hal"),
        new Player(18, 7, 'blue', '#c7c7ff', null, 0, true, false, "Jeremy"),
        new Player(7, 18, 'red', '#ffa8a8', null, 0, true, false, "Dave100")
    ]
    // use a set interval to represent a WebSocket
    if (!intervalSet) {
        let interv = setInterval(() => { 
            let tempCounter = counter;
            props.setPlayers((prev) => [...prev, playerOptions[tempCounter]])
            setCounter(counter + 1);
            if (counter >= playerOptions.length || props.inGame) {
                clearInterval(interv);
            }
        }, 5000);
        setIntervalSet(true);
    }
    // remove interval when starting game
    function startGame() {
        setCounter(100);
        props.setInGame(true);
    }
    return (
        <>
            <h2>Game Lobby</h2>
            <div className="start-game">
                <div className="game-players">
                    {props.players.map(player => (
                        <div className="player-opt" key={player.name}><span style={{backgroundColor: player.color}} className="small-circle"></span> {player.name}</div>
                    ))}
                </div>
                <button className="my-button" onClick={startGame}>Start Game</button>
            </div>
        </>
    )
}