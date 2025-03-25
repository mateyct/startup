import React, { useEffect, useState } from "react";
import clueData from "./datafiles/clueData.json";
import { webSocket } from "./webSocketHandler";

export default function GuessingForm(props) {
    // set up initial values, since they are automatic in the HTML
    const [chosenWeapon, setChosenWeapon] = useState(Object.keys(clueData.weaponIdNames)[0]);
    const [chosenPlayer, setChosenPlayer] = useState(props.players[0].name);
    const players = props.players;
    const turn = props.turn;

    useEffect(() => {
        webSocket.guessResult = data => {
            // check if the game is over
            if (data.winner >= 0) {
                props.setWinner(tempPlayers[data.winner]);
            }
            else {
                // add correct and incorrect data
                props.addIntel(data.results);
            }
        };
    });

    // submit the guessing form and change values
    function handleSubmit() {
        // generate the new guess data
        let newGuess = {
            type: "guess",
            guesser: players[turn].name,
            person: chosenPlayer,
            room: players[turn].currentRoom,
            weapon: chosenWeapon
        };
        // send the new chat
        webSocket.sendChat(props.gameID, newGuess);
        // change turns now
        let tempPlayers = JSON.parse(JSON.stringify(players));
        tempPlayers[turn].recentArrival = false; // this for tracking when a player recently entered a room
        tempPlayers[turn].turn = false;
        let nextTurn = (turn + 1) % players.length;
        props.setTurn(nextTurn);
        props.setPlayers(tempPlayers);
        // WebSocket to the server
        let newChat = { type: "line", message: (tempPlayers[nextTurn].name) + "'s turn" };
        // add to the chat on the server
        webSocket.sendChat(props.gameID, newChat);
        // check if guess is a winning one
        webSocket.makeGuess(props.gameID, players[turn].name, chosenPlayer, chosenWeapon, players[turn].currentRoom, nextTurn);
    }

    return (
        <div>
            <h3>Make a guess</h3>
            <fieldset disabled={props.playerTurn != turn || players[turn].currentRoom == null || !players[turn].recentArrival}>
                <div>
                    <label>Player</label>
                    <select name="playerChoice" onChange={(event) => setChosenPlayer(event.target.value)}>
                        {players.map(player => (
                            <option key={player.name} value={player.name}>{player.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Weapon</label>
                    <select name="weaponChoice" onChange={(event) => {setChosenWeapon(event.target.value)}}>
                        <WeaponChoice />
                    </select>
                </div>
                <p>
                    <button type="button" className="my-button" onClick={handleSubmit}>Submit</button>
                </p>
            </fieldset>
        </div>
    );
}

// function for displaying weapon choice
function WeaponChoice() {
    const choices = [];
    let keys = Object.keys(clueData.weaponIdNames);
    // loop and return choices
    keys.map(weaponID => {
        choices.push(<option key={weaponID} value={weaponID}>{clueData.weaponIdNames[weaponID]}</option>)
    });
    return choices;
}