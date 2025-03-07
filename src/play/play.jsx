import React, { useEffect, useRef, useState } from "react";
import { Game } from "./game";
import './play.css';
import { Player } from "./player";
import { Link } from "react-router-dom";

// also have player options
const playerOptions = [
    new Player(7, 0, 'yellow', '#FFFFC5', null, 0, true, false, ""),
    new Player(7, 7, 'green', '#c4ffc4', null, 0, true, false, ""),
    new Player(18, 7, 'blue', '#c7c7ff', null, 0, true, false, ""),
    new Player(7, 18, 'red', '#ffa8a8', null, 0, true, false, "")
]

export function Play(props) {
    const [gameID, setGameID] = useState('');
    const [inGame, setInGame] = useState(false);
    // players that are used
    const [players, setPlayers] = useState([]);
    const [winner, setWinner] = useState();
    // define which player's turn
    const [playerTurn, setPlayerTurn] = useState(null);

    // fetch if this user is in a game
    useEffect(() => {
        fetch("/api/lobby/player/status")
            .then(response => response.json())
            .then(data => {
                // if they are in a game, set all the relevant things
                if(data.found) {
                    setGameID(data.lobbyID);
                    setInGame(data.inGame);
                    setPlayerTurn(data.playerIndex);
                    setPlayers(() => {
                        let players = [];
                        data.players.forEach((player, index) => {
                            let chosenPlayer = playerOptions[index];
                            chosenPlayer.name = player.username;
                            chosenPlayer.x = player.x;
                            chosenPlayer.y = player.y;
                            players.push(chosenPlayer);
                        })
                        return players;
                    });
                }
            });
    }, []);

    return (
        <main>
            {winner && <WinScreen winner={winner} />}
            {!winner && !gameID && <Join gameID={gameID} setGameID={setGameID} />}
            {!winner && gameID && !inGame && <GameLobby gameID={gameID} inGame={inGame} setInGame={setInGame} userName={props.userName} players={players} setPlayers={setPlayers} />}
            {!winner && gameID && inGame && <Game gameID={gameID} players={players} setPlayers={setPlayers} setWinner={setWinner} playerIndex={playerTurn} />}
        </main>
    );
}

function Join(props) {
    // rooms here represents different instances of the game
    const [lobbies, setLobbies] = useState([]);
    const intervalID = useRef(null);
    // set and unset interval with Effect, represents WebSocket stuff
    useEffect(() => {
        // set interval to show new lobbies automatically
        intervalID.current = setInterval(() => {
            fetch("/api/lobbies")
                .then(response => response.json())
                .then(json => {
                    setLobbies(json.lobbies);
                });
        }, 1000);
        // cleanup
        return () => {
            clearInterval(intervalID.current);
        };
    }, []);
    // function that creates a new room
    async function createRoom() {
        // call the method, it will return the lobby ID
        fetch("/api/lobbies", {
            method: "POST",
        })
            .then(res => res.json())
            .then(json => {
                props.setGameID(json.lobbyID);
            });

    }
    // function to join a game
    function joinLobby(id) {
        fetch(`/api/lobby/players/${id}`, {
            method: 'put'
        })
            .finally(response => {
                if(response?.status == 200) {
                    props.setGameID(id)
                }
                else {
                    console.log("Lobby full");
                }
            });

    }
    return (
        <>
            <h2>Join a game</h2>
            <div className="join-room">
                <button className="my-button" onClick={createRoom}>Create Room</button>
                <div className="available-rooms">
                    {Object.keys(lobbies).map(lobbyID => (
                        <div key={lobbyID} className="room-join-option" onClick={() => joinLobby(lobbyID)}>{lobbies[lobbyID].lobbyName}</div>
                    ))}
                </div>
            </div>
        </>
    )
}

function GameLobby(props) {
    const [counter, setCounter] = useState(0); // also should be temporary
    const intervalID = useRef(null);
    // use a set interval and useEffect to represent a WebSocket
    useEffect(() => {
        intervalID.current = setInterval(() => {
            fetch(`/api/lobby/players/${props.gameID}`)
                .then(result => result.json())
                .then(json => {
                    const playerObjs = json.players;
                    const players = [];
                    if (playerObjs) {
                        playerObjs.forEach((player, index) => {
                            let chosenPlayer = playerOptions[index];
                            chosenPlayer.name = player.username;
                            chosenPlayer.x = player.x;
                            chosenPlayer.y = player.y;
                            players.push(chosenPlayer);
                        });
                        props.setPlayers(players);
                    }
                })
        }, 500);

        return () => {
            clearInterval(intervalID.current);
        }
    }, []);
    // button clicked to start the game
    function startGame() {
        fetch(`/api/lobby/activate/${props.gameID}`, {method: 'PUT'});
        props.setInGame(true);
    }
    return (
        <>
            <h2>Game Lobby</h2>
            <div className="start-game">
                <div className="game-players">
                    {props.players.map(player => (
                        <div className="player-opt" key={player.name}><span style={{ backgroundColor: player.color }} className="small-circle"></span> {player.name}</div>
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
            <marquee scrollamount="15" direction="right" style={{ color: props.winner.color }}>{props.winner.name + " Wins!"}</marquee>
            <Link className="middle-link my-button" to="/history">Go to History</Link>
        </>
    )
}