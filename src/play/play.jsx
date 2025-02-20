import React, { use, useState } from "react";
import { Game } from "./game";
import './play.css';

export function Play() {
    const [gameID, setGameID] = useState('');
    const [inGame, setInGame] = useState(false);
    // rooms here represents different instances of the game
    const [rooms, setRooms] = useState([13232]);
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
            {gameID && inGame && <Game gameID={gameID} />}
        </main>
    );
}

function Join(props) {
    const [intervalSet, setIntervalSet] = useState(false); // this is pretty temporary
    // use a set interval to represent a WebSocket
    if(!intervalSet) {
        let counter = 0;
        let interv = setInterval(() => {
            counter++;
            props.setRooms((prev) => [...prev, Math.round(Math.random() * 100000)])
            if(counter >= 5) {
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