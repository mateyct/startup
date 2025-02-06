import React from "react";
import "./history.css"

export function History() {
    return (
        <main>
            {/*Placeholder for displaying history of suspicions*/}
            <h1>History of Suspicions</h1>
            <div className="table-responsive-mine">
                <table id="history-table">
                    <thead className="thead-dark">
                        <tr>
                            <th>Date</th>
                            <th>Guess #</th>
                            <th>Accusor</th>
                            <th>Person</th>
                            <th>Room</th>
                            <th>Weapon</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="history-item">
                            <td>1/23/2025</td>
                            <td>1</td>
                            <td>You (Mark123)</td>
                            <td>Dave100</td>
                            <td>Lobby</td>
                            <td>Stethoscope</td>
                        </tr>
                        <tr className="history-item">
                            <td>1/23/2025</td>
                            <td>2</td>
                            <td>Jeremy</td>
                            <td>You (Mark123)</td>
                            <td>Clinic</td>
                            <td>Syringe</td>
                        </tr>
                        <tr className="history-item">
                            <td>1/23/2025</td>
                            <td>3</td>
                            <td>Dave100</td>
                            <td>Jeremy</td>
                            <td>Clinic</td>
                            <td>Syringe</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    );
}