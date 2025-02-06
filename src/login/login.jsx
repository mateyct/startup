import React from "react";
import "./login.css"

export function Login() {
    return (
        <main className="index-main">
            <form className="login-form" action="play.html">
                <h2>Log in to Medical Murdery Mystery</h2>
                <div>
                    <div>
                        <label>Username</label>
                        <input type="text" id="username" placeholder="Username" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" id="password" placeholder="Password" />
                    </div>
                    <input type="submit" value="Log In" className="my-button" />
                </div>
            </form>
        </main>
    );
}