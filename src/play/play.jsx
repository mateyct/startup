import React, { use, useState } from "react";
import { Game } from "./game";
import './play.css';

export function Play() {
    const [gameID, setGameID] = useState('');
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
            {!gameID && <Join gameID={gameID} setGameID={setGameID} />}
            {gameID && <Game />}
        </main>
    );
}

function Join(props) {
    return (
        <div className="join-room">
            <div className="available-rooms">

            </div>
            <button className="my-button">Create Room</button>
        </div>
    )
}