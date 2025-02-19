import React, { useState } from "react";
import "./login.css"
import { Auth } from "./auth";

export function Login(props) {
    const [userName, setUserName] = useState(props.userName);
    const [password, setPass] = useState('');
    // function for logging in
    function logIn() {
        localStorage.setItem('userName', userName);
        props.setUserName(userName);
        props.setUserAuth(Auth.Authenticated);
    }
    // function for creating account
    function create() {
        localStorage.setItem('userName', userName);
        props.setUserName(userName);
        props.setUserAuth(Auth.Authenticated);
    }
    return (

        <main className="index-main">
            {props.userAuth === Auth.Unauthenticated && (
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
                        <input type="submit" name="login" value="Log In" className="my-button" disabled={!userName || !password} onClick={logIn} />
                        <input type="submit" name="create" value="Create" className="my-button" disabled={!userName || !password} onClick={create} />
                    </div>
                </form>
            )}
            {props.userAuth === Auth.Authenticated && (
                <button className="my-button" type="button" style={{borderRadius: 5}} onClick={() => {
                    localStorage.removeItem('userName');
                    props.setUserAuth(Auth.Unauthenticated);
                }}>Log Out</button>
            )}
        </main>
    );
}