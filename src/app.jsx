import React, { useEffect, useState } from 'react';
import './app.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Login } from './login/login';
import { History } from './history/history';
import { Play } from './play/play';
import { Auth } from './login/auth';
import Unauthorized from './unauthorized';

export default function App() {
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [userAuth, setUserAuth] = useState(userName ? Auth.Authenticated : Auth.Unauthenticated);

    return (
        <React.StrictMode>
            <BrowserRouter>
                <Header userName={userName} userAuth={userAuth} />
                <Routes>
                    <Route path='/' element={<Login userName={userName} setUserName={setUserName} userAuth={userAuth} setUserAuth={setUserAuth} />} exact />
                    <Route path='/play' element={ userAuth == Auth.Authenticated ? <Play userName={userName} /> : <Unauthorized /> } />
                    <Route path='/history' element={ userAuth == Auth.Authenticated ? <History /> :  <Unauthorized />}/>
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
    // set up state for verse stuff
    const [reference, setReference] = useState("Loading...");
    const [text, setText] = useState("Loading...");
    useEffect(() => {
        fetch('https://book-of-mormon-api.vercel.app/random')
            .then(response => response.json())
            .then(json => {
                setReference(json.reference);
                setText(json.text);
            });
        
    }, []);
    return (
        <footer className="footer">
            <hr/>
            <div className="verse">
                <p className="v-title">{ reference }</p>
                <p className="v-verse">{ text }</p>
            </div>
            <p>Mason Tolley<a href="https://github.com/mateyct/startup.git" target="_blank"> GitHub</a></p>
        </footer>
    );
};