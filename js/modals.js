"use strict";
window.onload = () => {
    let controlPanel = document.querySelector('#controls');
    let chatPanel = document.querySelector('#chat-box');
    // add open modal code
    document.getElementById('open-controls').addEventListener('click', () => {
        controlPanel.classList.add('modal');
    });
    document.getElementById('open-chat').addEventListener('click', () => {
        chatPanel.classList.add('modal');
    });
    // add close modal code
    document.getElementById("close-controls").addEventListener("click", () => {
        controlPanel.classList.remove('modal');
    });
    document.getElementById('close-chat').addEventListener('click', () => {
        chatPanel.classList.remove('modal');
    });
};