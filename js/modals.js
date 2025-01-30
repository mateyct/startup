"use strict";
window.onload = () => {
    let controlPanel = document.querySelector('#controls');
    let chatPanel = document.querySelector('.chatbox');
    // add open modal code
    document.getElementById('open-controls').addEventListener('click', () => {
        controlPanel.classList.add('modal');
    });
    // add close modal code
    document.getElementById("close-controls").addEventListener("click", () => {
        controlPanel.classList.remove('modal');
    });
};