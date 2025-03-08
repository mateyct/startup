import React, { useEffect, useState } from "react";
import "./history.css";
import clueData from "../play/datafiles/clueData.json";

export function History() {
    const [history, setHistory] = useState();
    useEffect(() => {
        fetch('/api/history')
            .then(response => response.json())
            .then(data => {
                setHistory(data.history);
            });
    });
    return (
        <main>
            {/*Placeholder for displaying history of suspicions*/}
            <h1>History of Suspicions</h1>
            {history && <div className="table-responsive-mine">
                <table id="history-table">
                    <thead className="thead-dark">
                        <tr>
                            <th>Date</th>
                            <th>Accusor</th>
                            <th>Person</th>
                            <th>Room</th>
                            <th>Weapon</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((guess, index) => (
                            <tr className="history-item" key={index}>
                                <td>
                                    {new Date(guess.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    })}
                                </td>
                                <td>{guess.guesser}</td>
                                <td>{guess.person}</td>
                                <td>{clueData.roomIdNames[guess.room]}</td>
                                <td>{clueData.weaponIdNames[guess.weapon]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>}
            {!history && <div style={{textAlign: "center", fontSize: "2em"}}>Loading...</div>}
        </main>
    );
}