import React from 'react';
import './app.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Login } from './login/login';
import { History } from './history/history';
import { Play } from './play/play';

export default function App() {
    return (
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path='/' element={<Login />} exact />
                <Route path='/play' element={<Play />} />
                <Route path='/history' element={<History />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    )
}

const Header = () => {
    return (
        <header>
            <div className="header-row">
                <span><a href="/"><img src="/favicon.ico"/></a></span>
                <a href="/"><h1 className="header-title mobile-hidden">Medical Murder Mystery</h1><h1 className="header-title large-screen-hidden">MMM</h1></a>
                <span><p className="current-user">None</p></span>
            </div>
            <nav className="navigation">
                <ul>
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="play">Play</NavLink></li>
                    <li><NavLink to="history">History</NavLink></li>
                </ul>
            </nav>
            <hr />
        </header>
    );
};

const Footer = () => {
    return (
        <footer className="footer">
            <hr/>
            <div className="verse">
                <p className="v-title">3 Nephi 5:13</p>
                <p className="v-verse">Behold, I am a disciple of Jesus Christ, the Son of God. I have been called of him to declare his word among his people, that they might have everlasting life.</p>
            </div>
            <p>Mason Tolley<a href="https://github.com/mateyct/startup.git" target="_blank"> GitHub</a></p>
        </footer>
    );
};