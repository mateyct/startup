import React, {useState} from "react";
import "./history.css"

export function History() {
    const [history, setHistory] = useState(JSON.parse(localStorage.getItem("history")));
    return (
        <main>
            {/*Placeholder for displaying history of suspicions*/}
            <h1>History of Suspicions</h1>
            <div className="table-responsive-mine">
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
                                <td>{guess.room}</td>
                                <td>{guess.weapon}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}