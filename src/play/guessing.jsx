import React, { useState } from "react";
import clueData from "./datafiles/clueData.json";

export default function GuessingForm(props) {
    // set up initial values, since they are automatic in the HTML
    const [chosenWeapon, setChosenWeapon] = useState(Object.keys(clueData.weaponIdNames)[0]);
    const [chosenPlayer, setChosenPlayer] = useState(props.players[0].name);
    const players = props.players;
    const turn = props.turn;
    const answers = props.answers.current;

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
        // check if guess is a winning one
        console.log("correct: ", answers.player, answers.room, answers.weapon); // keep for debugging purposes
        console.log("guess: ", chosenPlayer, players[turn].currentRoom, chosenWeapon);
        let correctFlags = 0; // 3 flags is a winner
        // determine player
        if (answers.player == chosenPlayer) {
            props.addIntel("Correct: " + chosenPlayer);
            correctFlags++;
        }
        else {
            props.addIntel("Incorrect: " + chosenPlayer);
        }
        // determine player
        if (answers.room == players[turn].currentRoom) {
            props.addIntel("Correct: " + clueData.roomIdNames[players[turn].currentRoom]);
            correctFlags++;
        }
        else {
            props.addIntel("Incorrect: " + clueData.roomIdNames[players[turn].currentRoom]);
        }
        if (answers.weapon == chosenWeapon) {
            props.addIntel("Correct: " + clueData.weaponIdNames[chosenWeapon]);
            correctFlags++;
        }
        else {
            props.addIntel("Incorrect: " + clueData.weaponIdNames[chosenWeapon]);
        }
        if (correctFlags >= 3) {
            props.setChat(old => [{ type: "line", message: (tempPlayers[turn].name + " guessed correctly and wins!")}, ...old]);
            props.setWinner(tempPlayers[turn]);
        }
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