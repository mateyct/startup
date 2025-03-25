import React, { use, useEffect, useRef, useState } from "react";
import { Game } from "./game";
import './play.css';
import { playerOptions } from "./player";
import { Link } from "react-router-dom";
import { webSocket } from "./webSocketHandler";

export function Play(props) {
    const [gameID, setGameID] = useState('');
    const [inGame, setInGame] = useState(false);
    // players that are used
    const [players, setPlayers] = useState([]);
    const [winner, setWinner] = useState();
    // define which player's turn
    const [playerTurn, setPlayerTurn] = useState(null);
    const [turn, setTurn] = useState(0);
    const [intel, setIntel] = useState({});
    const [chatlog, setChat] = useState([]);

    // fetch if this user is in a game
    useEffect(() => {
        fetch("/api/lobby/player/status")
            .then(response => response.json())
            .then(data => {
                let herePlayers = [];
                // if they are in a game, set all the relevant things
                if (data.found) {
                    setPlayers(() => {
                        herePlayers = [];
                        data.players.forEach((player, index) => {
                            let chosenPlayer = playerOptions[index];
                            chosenPlayer.name = player.name;
                            chosenPlayer.x = player.x;
                            chosenPlayer.y = player.y;
                            chosenPlayer.moves = player.moves;
                            chosenPlayer.currentRoom = player.currentRoom;
                            chosenPlayer.recentArrival = player.recentArrival;
                            herePlayers.push(chosenPlayer);
                        });
                        return herePlayers;
                    });
                    if (data.winner >= 0) {
                        setWinner(herePlayers[data.winner]);
                    }
                    setGameID(data.lobbyID);
                    setInGame(data.inGame);
                    setPlayerTurn(data.playerIndex);
                    setIntel(data.players[data.playerIndex].guesses);
                    setTurn(data.turn);
                    setChat(data.chatlog);
                }
            });
    }, []);

    // Make the websocket connection
    useEffect(() => {
        webSocket.initialize();

        webSocket.startGameResult = data => {
            setupPlayers(data.players);
            setInGame(true);
            setPlayerTurn(data.playerIndex);
            webSocket.startGameResult = () => {console.log('deactivated in start game callback')};
            webSocket.setupPlayers = () => { };
        };
        // call updatePlayers, message for when players join the game
        webSocket.updatePlayers = data => {
            setupPlayers(data.players);
        };

        // Use this to clean up the web socket when the page is left
        return () => {
            webSocket.cleanup()
            webSocket.startGameResult = () => {console.log('deactivated in play clean up')};
            webSocket.setupPlayers = () => { };
        };
    }, []);

    // function to set up players when message is received
    function setupPlayers(playerData) {
        const playersToSet = [];
        playerData.forEach((player, index) => {
            let chosenPlayer = playerOptions[index];
            chosenPlayer.name = player.name;
            chosenPlayer.x = player.x;
            chosenPlayer.y = player.y;
            playersToSet.push(chosenPlayer);
        });
        setPlayers(playersToSet);
    }

    return (
        <main>
            {winner && <WinScreen winner={winner} />}
            {!winner && !gameID && <Join gameID={gameID} setGameID={setGameID} />}
            {!winner && gameID && !inGame && <GameLobby gameID={gameID} inGame={inGame} setInGame={setInGame} userName={props.userName} players={players} setPlayers={setPlayers} setTurn={setTurn} />}
            {!winner && gameID && inGame && <Game gameID={gameID} players={players} setPlayers={setPlayers} setWinner={setWinner} playerIndex={playerTurn} turn={turn} setTurn={setTurn} intel={intel} setIntel={setIntel} chatlog={chatlog} setChat={setChat} />}
        </main>
    );
}

function Join(props) {
    // rooms here represents different instances of the game
    const [lobbies, setLobbies] = useState([]);
    const intervalID = useRef(null);
    // set and unset interval with Effect, represents WebSocket stuff
    /* useEffect(() => {
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
    }, []); */
    // set up function to receive lobby updates
    useEffect(() => {
        webSocket.createNewLobby = data => {
            setLobbies(data);
        };
        // set up so creator of a lobby is also added
        webSocket.creatorJoin = data => {
            props.setGameID(data.lobbyID);
        }
        // get the list of lobbies the first time
        fetch('/api/lobbies')
            .then(data => data.json())
            .then(json => {
                setLobbies(json.lobbies);
            });

        // cleanup so it only fires the function when this is loaded
        return () => {
            webSocket.createNewLobby = () => { };
            webSocket.creatorJoin = () => { };
        };
    }, []);
    // function that creates a new room
    async function createRoom() {
        // call the method, it will return the lobby ID
        /* fetch("/api/lobbies", {
            method: "POST",
        })
            .then(res => res.json())
            .then(json => {
                props.setGameID(json.lobbyID);
            }); */
        webSocket.createLobby(localStorage.getItem("userName"));
    }
    // function to join a game
    function joinLobby(id) {
        /* fetch(`/api/lobby/players/${id}`, {
            method: 'put'
        })
            .then(response => {
                if (response?.status == 200) {
                    props.setGameID(id);
                    
                }
                else {
                    console.log("Lobby full");
                }
            }); */
        webSocket.joinLobby(id);
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
    /* useEffect(() => {
        intervalID.current = setInterval(() => {
            fetch(`/api/lobby/players/${props.gameID}`)
                .then(result => result.json())
                .then(json => {
                    const playerObjs = json.players;
                    const players = [];
                    if (playerObjs) {
                        playerObjs.forEach((player, index) => {
                            let chosenPlayer = playerOptions[index];
                            chosenPlayer.name = player.name;
                            players.push(chosenPlayer);
                        });
                        props.setPlayers(players);
                    }
                    if (json.start) {
                        props.setInGame(true);
                    }
                });
        }, 500);

        return () => {
            clearInterval(intervalID.current);
        }
    }, []); */
    // button clicked to start the game
    function startGame() {
        /* fetch(`/api/lobby/activate/${props.gameID}`, { method: 'PUT' })
            .then(response => response.json())
            .then(data => {
                const players = [];
                data.players.forEach((player, index) => {
                    let chosenPlayer = playerOptions[index];
                    chosenPlayer.name = player.name;
                    chosenPlayer.x = player.x;
                    chosenPlayer.y = player.y;
                    players.push(chosenPlayer);
                });
                props.setPlayers(players);
            }); */
        //props.setInGame(true);
        webSocket.startGame(props.gameID);
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