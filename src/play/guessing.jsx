import React from "react";

export default function GuessingForm(props) {

    const players = props.players;
    const turn = props.turn;
    
    <div onSubmit={(event) => {
        // add the guess to the chat
        setChat(old => {
            console.log("Why the heck is this run twice?");
            let newGuess = {
                type: "guess",
                guesser: players[turn].name,
                person: event.target.playerChoice.value,
                room: players[turn].currentRoom,
                weapon: event.target.weaponChoice.value
            };
            let history = localStorage.getItem("history");
            if(!history) {
                localStorage.setItem("history", JSON.stringify([newGuess]));
            }
            else {
                let parsedHistory = JSON.parse(history);
                parsedHistory.push(newGuess);
                localStorage.setItem("history", JSON.stringify(parsedHistory));
            }
            return [newGuess, ...old];
        });
        console.log("But this is only once?");
        // switch the players to the next turn
        let tempPlayers = JSON.parse(JSON.stringify(players));
        tempPlayers[turn].recentArrival = false; // this for tracking when a player recently entered a room
        tempPlayers[turn].turn = false;
        let nextTurn = (turn + 1) % players.length;
        props.setTurn(nextTurn);
        props.setChat(old => [{type: "line", message: (tempPlayers[nextTurn].name) + "'s turn"}, ...old]);
        props.setPlayers(tempPlayers);
    }}>
        <h3>Make a guess</h3>
        <fieldset disabled={players[turn].currentRoom == null || !players[turn].recentArrival}>
            <div>
                <label>Player</label>
                <select name="playerChoice">
                    {players.map(player => (
                        <option key={player.name} value={player.name}>{player.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Weapon</label>
                <select name="weaponChoice">
                    <WeaponChoice weaponIdNames={weaponIdNames} />
                </select>
            </div>
            <p>
                <input type="submit" className="my-button"/>
            </p>
        </fieldset>
    </div>
}