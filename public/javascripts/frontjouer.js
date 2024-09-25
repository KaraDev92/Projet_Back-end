"use strict"

const socket = io();

const baliseForm = window.document.getElementById('formulaire');
const balisePseudo = window.document.getElementById('pseudo')

baliseForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = balisePseudo.value;
    console.log(message);
    socket.emit('identifier',message);
});


socket.on("pseudoExisteDeja", (data) => {
    let p = document.createElement("p");
    p.innerHTML = data;
    document.baliseForm.appendChild(p);
});