import React, { useState } from "react";
import "./login.css"
import { Auth } from "./auth";

export function Login(props) {
    const [userName, setUserName] = useState(props.userName);
    const [password, setPass] = useState('');
    const [returnMessage, setReturnMessage] = useState(null);
    // function for logging in
    async function logIn() {
        doAuthWork('put');
    }
    // function for creating account
    async function create() {
        doAuthWork('post');
    }

    // helper function for making the fetch
    async function doAuthWork(method) {
        // call server to log in or create user
        const result = await fetch('/api/auth', {
            method: method,
            headers: { 'Content-type': 'application/json'},
            body: JSON.stringify({
                username: userName,
                password: password
            })
        });
        // if it's all good, log in
        if(result?.status === 200) {
            localStorage.setItem('userName', userName);
            props.setUserName(userName);
            props.setUserAuth(Auth.Authenticated);
        }
        else {
            const failInfo = await result.json();
            setReturnMessage(failInfo.msg);
        }
    }

    // log out function
    async function logout() {
        const result = await fetch('/api/auth', {
            method: "delete"
        });
        if (result?.status == 200) {
            localStorage.removeItem('userName');
            props.setUserAuth(Auth.Unauthenticated);
        }
        else {
            const failInfo = await result.json();
            setReturnMessage(failInfo.msg);
        }
    }

    return (

        <main className="index-main">
            {props.userAuth === Auth.Unauthenticated && (
                <>
                {returnMessage && <div className="return-message">{returnMessage}</div>}
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
                </>
            )}
            {props.userAuth === Auth.Authenticated && (
                <button className="my-button" type="button" style={{borderRadius: 5}} onClick={logout}>Log Out</button>
            )}
        </main>
    );
}