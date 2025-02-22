import React, { useState } from 'react';
import './app.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Login } from './login/login';
import { History } from './history/history';
import { Play } from './play/play';
import { Auth } from './login/auth';

export default function App() {
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [userAuth, setUserAuth] = useState(userName ? Auth.Authenticated : Auth.Unauthenticated);

    return (
        <React.StrictMode>
            <BrowserRouter>
                <Header userName={userName} userAuth={userAuth} />
                <Routes>
                    <Route path='/' element={<Login userName={userName} setUserName={setUserName} userAuth={userAuth} setUserAuth={setUserAuth} />} exact />
                    <Route path='/play' element={<Play userName={userName} />} />
                    <Route path='/history' element={<History />} />
                </Routes>
                <Footer />
            </BrowserRouter>
        </React.StrictMode>
    )
}

const Header = (props) => {
    return (
        <header>
            <div className="header-row">
                <span><a href="/"><img src="/favicon.ico"/></a></span>
                <a href="/"><h1 className="header-title mobile-hidden">Medical Murder Mystery</h1><h1 className="header-title large-screen-hidden">MMM</h1></a>
                <span><p className="current-user">{props.userAuth === Auth.Authenticated ? props.userName : "None"}</p></span>
            </div>
            {props.userAuth == Auth.Authenticated && (
            <nav className="navigation">
                <ul>
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="play">Play</NavLink></li>
                    <li><NavLink to="history">History</NavLink></li>
                </ul>
            </nav>
            )}
            <hr />
        </header>
    );
};

const Footer = () => {
    let verse = getVerse();
    return (
        <footer className="footer">
            <hr/>
            <div className="verse">
                <p className="v-title">{ verse.reference }</p>
                <p className="v-verse">{verse.text}</p>
            </div>
            <p>Mason Tolley<a href="https://github.com/mateyct/startup.git" target="_blank"> GitHub</a></p>
        </footer>
    );
};

// represents a 3rd party API
function getVerse() {
    return {
        reference: "3 Nephi 5:13",
        text: "Behold, I am a disciple of Jesus Christ, the Son of God. I have been called of him to declare his word among his people, that they might have everlasting life."
    };
}