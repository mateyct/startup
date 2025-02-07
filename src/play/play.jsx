import React from "react";
import "./play.css"

export function Play() {
    return (
        <main>
            <h1>Play</h1>
            <hr />
            <section id="play-page-layout">
                {/*Section on left for controls/info*/}
                <div id="controls">
                    <div className="secret-info">
                        {/*Info section*/}
                        <button id="close-controls" className="large-screen-hidden"></button>
                        <h3>Your Secret Info</h3>
                        <ul>
                            <li>Dr. Tyler is innocent</li>
                            <li>The Syringe was not involved</li>
                            <li>It didn't happen in the Lobby</li>
                            <li>The Reflex Hammer was not involved</li>
                        </ul>
                    </div>
                    <div className="rolling">
                        {/*Dice section*/}
                        <h3>Roll for movement</h3>
                        <p>Moves left: 4<span id="moves-left"></span></p>
                        <button id="dice-roll" className="my-button">Roll Die</button>
                    </div>
                    <div className="guessing">
                        {/*Form for making a guess*/}
                        <form method="dialog" action="play.html">
                            <h3>Make a guess</h3>
                            <div>
                                <label>Player</label>
                                <select>
                                    <option>Dave100</option>
                                    <option>You</option>
                                    <option>Jeremy</option>
                                </select>
                            </div>
                            <div>
                                <label>Room</label>
                                <select>
                                    <option>Clinic</option>
                                    <option>Doctor's Office</option>
                                    <option>Director's Office</option>
                                    <option>Lab</option>
                                    <option>ICU</option>
                                    <option>Operating Room</option>
                                    <option>Lobby</option>
                                    <option>MRI Room</option>
                                </select>
                            </div>
                            <div>
                                <label>Weapon</label>
                                <select>
                                    <option>Stethoscope</option>
                                    <option>Syringe</option>
                                    <option>Reflex Hammer</option>
                                    <option>IV Needle</option>
                                    <option>Pulling the Plug</option>
                                    <option>Latex Gloves</option>
                                    <option>Boredom</option>
                                    <option>Defibrilator</option>
                                </select>
                            </div>
                            <p>
                                <input type="submit" className="my-button" />
                            </p>
                        </form>
                    </div>
                </div>
                {/*Middle section that's a play area*/}
                <div className="player-area">
                    {/*Main playing feature things*/}
                    <div id="board">
                        <div className="room clinic">Clinic</div>
                        <div className="door" style={{gridArea: "6 / 3 / 7 / 4"}}></div>
                        <div className="door" style={{gridArea: "4 / 6 / 5 / 7"}}></div>
                        <div className="room dr-office">Dr. Office</div>
                        <div className="door" style={{gridArea: "2 / 15 / 3 / 16"}}></div>
                        <div className="door" style={{gridArea: "6 / 12 / 7 / 13"}}></div>
                        <div className="door" style={{gridArea: "2 / 10 / 3 / 11"}}></div>
                        <div className="room dir-office">Director's Office</div>
                        <div className="door" style={{gridArea: "5 / 19 / 6 / 20"}}></div>
                        <div className="door" style={{gridArea: "6 / 22 / 7 / 23"}}></div>
                        <div className="room lab">Lab</div>
                        <div className="door" style={{gridArea: "11 / 6 / 12 / 7"}}></div>
                        <div className="door" style={{gridArea: "15 / 5 / 16 / 6"}}></div>
                        <div className="void"></div>
                        <div className="room icu">ICU</div>
                        <div className="door" style={{gridArea: "10 / 21 / 11 / 22"}}></div>
                        <div className="door" style={{gridArea: "15 / 23 / 16 / 24"}}></div>
                        <div className="door" style={{gridArea: "13 / 19 / 14 / 20"}}></div>
                        <div className="room operating">Operating Room</div>
                        <div className="door" style={{gridArea: "22 / 6 / 23 / 7"}}></div>
                        <div className="door" style={{gridArea: "19 / 3 / 20 / 4"}}></div>
                        <div className="room lobby">Lobby</div>
                        <div className="door" style={{gridArea: "19 / 12 / 20 / 13"}}></div>
                        <div className="door" style={{gridArea: "19 / 13 / 20 / 14"}}></div>
                        <div className="room mri">MRI Room</div>
                        <div className="door" style={{gridArea: "19 / 22 / 20 / 23"}}></div>
                        <div className="door" style={{gridArea: "22 / 19 / 23 / 20"}}></div>
                        <Cells />
                    </div>
                </div>
                <div className="large-screen-hidden modal-buttons">
                    <button type="button" id="open-controls">Open Controls</button>
                    <button type="button" id="open-chat">Open Chat</button>
                </div>
                {/*Section on the right, shows live info from others and such*/}
                <div id="chat-box">
                    {/*Show the players*/}
                    <div>
                        <button id="close-chat" className="large-screen-hidden"></button>
                        <h3>Players</h3>
                        <ul>
                            <li>Dave100</li>
                            <li>You</li>
                            <li>Jeremy</li>
                        </ul>
                    </div>
                    {/*A place for an info chat*/}
                    <div className="chat-header">
                        <h3>Info Chat</h3>
                    </div>
                    <div id="chat">
                        <div className="chat-message">
                            <p>Jeremy Entered Lobby</p>
                        </div>
                        <div className="chat-message">
                            <p>Dave100 Entered Clinic</p>
                        </div>
                        <div className="chat-message">
                            <p>Jeremy suspected the murderer was:</p>
                            <ul>
                                <li>You</li>
                                <li>In the Clinic</li>
                                <li>With the Syringe</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}

/**
 * Loops and generates all the cells to use in the grid
 * @returns The list of cells
 */
function Cells() {
    let cells = [];
    for (let i = 0; i <= 251; i++) {
        cells.push(<div key={i} className="hall"></div>)
    }
    return cells;
}

function Doors() {
    
}