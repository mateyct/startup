import React, { useState } from "react";
import "./login.css"
import { Auth } from "./auth";

export function Login(props) {
    const [userName, setUserName] = useState(props.userName);
    const [password, setPass] = useState('');
    return (
        <main className="index-main">
            <form className="login-form" method="dialog">
                <h2>Log in to Medical Murdery Mystery</h2>
                <div>
                    <div>
                        <label>Username</label>
                        <input required type="text" id="username" name="username" placeholder="Username" onChange={(e) => setUserName(e.target.value)} />
                    </div>
                    <div>
                        <label>Password</label>
                        <input required type="password" id="password" name="password" placeholder="Password" onChange={e => setPass(e.target.value)} />
                    </div>
                    <input type="submit" name="login" value="Log In" className="my-button" disabled={!userName || !password} />
                    <input type="submit" name="create" value="Create" className="my-button" disabled={!userName || !password}  />
                </div>
            </form>
        </main>
    );
}