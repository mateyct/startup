import React, {useEffect, useRef, useState } from "react";
import { Game } from "./game";
import './play.css';
import { Player } from "./player";
import { Link } from "react-router-dom";

export function Play(props) {
    const [gameID, setGameID] = useState('');
    const [inGame, setInGame] = useState(false);
    // players that are used
    const [players, setPlayers] = useState([]);
    const [winner, setWinner] = useState(/* new Player(4, 4, "red", false, null, 4, false, false, "Test winner") */);

    return (
        <main>
            {winner && <WinScreen winner={winner} /> }
            {!winner && !gameID && <Join gameID={gameID} setGameID={setGameID} />}
            {!winner && gameID && !inGame && <GameLobby gameID={gameID} inGame={inGame} setInGame={setInGame} userName={props.userName} players={players} setPlayers={setPlayers} />}
            {!winner && gameID && inGame && <Game gameID={gameID} players={players} setPlayers={setPlayers} setWinner={setWinner} />}
        </main>
    );
}

function Join(props) {
    // rooms here represents different instances of the game
    const [lobbies, setLobbies] = useState([13232]);
    const intervalID = useRef(null);
    // set and unset interval with Effect, represents WebSocket stuff
    useEffect(() => {
        // stop setting interval if too much
        if (lobbies.length > 5) return;
        // set the interval
        intervalID.current = setInterval(() => {
            setLobbies((prev) => [...prev, Math.round(Math.random() * 100000)])
            if (lobbies.length > 5) {
                clearInterval(intervalID.current);
            }
        }, 5000);

        // return function to clear interval
        return () => {
            clearInterval(intervalID.current);
        }
    }, [lobbies]);
    // function that creates a new room
    function createRoom() {
        let randomID = Math.round(Math.random() * 100000);
        props.setGameID(randomID);
    }
    // function to join a game
    function joinLobby(id) {
        props.setGameID(id);
    }
    return (
        <>
            <h2>Join a game</h2>
            <div className="join-room">
                <button className="my-button" onClick={createRoom}>Create Room</button>
                <div className="available-rooms">
                    {lobbies.map(lobby => (
                        <div key={lobby} className="room-join-option" onClick={() => joinLobby(lobby)}>{lobby}</div>
                    ))}
                </div>
            </div>
        </>
    )
}

function GameLobby(props) {
    const [counter, setCounter] = useState(0); // also should be temporary
    const intervalID = useRef(null);
    // also have player options
    const playerOptions = [
        new Player(7, 0, 'yellow', '#FFFFC5', null, 0, true, false, props.userName),
        new Player(7, 7, 'green', '#c4ffc4', null, 0, true, false, "Hal"),
        new Player(18, 7, 'blue', '#c7c7ff', null, 0, true, false, "Jeremy"),
        new Player(7, 18, 'red', '#ffa8a8', null, 0, true, false, "Dave100")
    ]
    // use a set interval and useEffect to represent a WebSocket
    useEffect(() => {
        intervalID.current = setInterval(() => {
            // use functional method to get accurate count
            setCounter(oldCount => {
                if (oldCount >= playerOptions.length) {
                    clearInterval(intervalID.current);
                    return oldCount;
                }
                // return new count
                return oldCount + 1;
            });
        }, 3000);
        // return to clear interval
        return () => {
            clearInterval(intervalID.current);
        }
    }, []);
    // for updating the player
    useEffect(() => {
        if (counter < playerOptions.length) {
            // make temp players to save
            let tempPlayers = JSON.parse(JSON.stringify(props.players));
            tempPlayers.push(playerOptions[counter]);
            props.setPlayers(tempPlayers);
        }
    }, [counter, props.setPlayers]);

    // button clicked to start the game
    function startGame() {
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
                <button className="my-button" onClick={startGame} disabled={props.players.length < 2}>Start Game</button>
            </div>
        </>
    )
}

function WinScreen(props) {
    return (
        <>
            <marquee scrollamount="15" direction="right" style={{color:props.winner.color}}>{props.winner.name + " Wins!"}</marquee>
            <Link className="middle-link my-button" to="/history">Go to History</Link>
        </>
    )
}