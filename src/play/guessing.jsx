import React, { useState } from "react";
import clueData from "./datafiles/clueData.json";

export default function GuessingForm(props) {
    const [chosenWeapon, setChosenWeapon] = useState('');
    const [chosenPlayer, setChosenPlayer] = useState('');
    const players = props.players;
    const turn = props.turn;

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
        let oldGuess = JSON.parse(JSON.stringify(props.chatlog));
        props.setChat([newGuess, ...oldGuess]);
        // sets the local storage of guess history
        let history = localStorage.getItem("history");
        if (!history) {
            localStorage.setItem("history", JSON.stringify([newGuess]));
        }
        else {
            let parsedHistory = JSON.parse(history);
            parsedHistory.push(newGuess);
            localStorage.setItem("history", JSON.stringify(parsedHistory));
        }
        // change turns now
        let tempPlayers = JSON.parse(JSON.stringify(players));
        tempPlayers[turn].recentArrival = false; // this for tracking when a player recently entered a room
        tempPlayers[turn].turn = false;
        let nextTurn = (turn + 1) % players.length;
        props.setTurn(nextTurn);
        props.setPlayers(tempPlayers);
        props.setChat(old => [{ type: "line", message: (tempPlayers[nextTurn].name) + "'s turn" }, ...old]);
    }

    return (
        <div>
            <h3>Make a guess</h3>
            <fieldset disabled={players[turn].currentRoom == null || !players[turn].recentArrival}>
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