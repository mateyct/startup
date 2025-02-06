import React from 'react';
import './app.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

export default function App() {
    return (
        <BrowserRouter>
            <Header/>
        </BrowserRouter>
    )
}

const Header = () => {
    return (
        <header>
            <div className="header-row">
                <span><a href="/"><img src="public/favicon.ico"/></a></span>
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
        </header>
    );
};