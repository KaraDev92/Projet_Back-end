"use strict"

const socket = io();

const baliseForm = window.document.getElementById('formulaire');
let baliseJoueur = null;
let baliseAdversaire = null;
//const baliseJoueur2 = window.document.getElementById('joueur2');
let baliseConteneurChoixJoueur = null;
//const baliseConteneurChoixJoueur = window.document.getElementById('conteneur1');
let baliseEspaceJoueur = null;
let baliseEspaceAdversaire = null;
//const baliseEspaceJoueur2 = window.document.getElementById('espaceJoueur2');
const baliseScoreJouer1 = document.querySelector("scoreJoueur1 span");
const baliseScoreJouer2 = document.querySelector("scoreJoueur2 span");

const partie = {};
let joueur = "";
let coupJoue = "";

baliseForm.addEventListener('submit', (event) => {
    const balisePseudo = window.document.getElementById('pseudo');
    event.preventDefault();
    const message = balisePseudo.value.trim();
    console.log(message);
    socket.emit('identifier',message);
});


socket.on("histoireDePseudo", (data) => {
    let p = document.createElement("p");
    p.innerHTML = data;
    baliseForm.appendChild(p);
});

socket.on("mise-en-attente", (data) => {
    let p = document.createElement("p");
    p.setAttribute("id", "attente");
    p.innerHTML = data;
    baliseForm.appendChild(p);
});

socket.on("debut-partie", (data) => {
    baliseForm.setAttribute("display", "none");
    partie = data;
    if (socket.id === partie.player1.id) {
        joueur = player1;
        baliseJoueur = document.getElementById("joueur1");
        baliseAdversaire = document.getElementById("joueur2");
        baliseEspaceJoueur = document.getElementById('espaceJoueur1');
        baliseEspaceAdversaire = document.getElementById('espaceJoueur2');
        baliseConteneurChoixJoueur = document.getElementById('conteneur1');
        document.querySelector("idJoueur1 span").textContent = partie.player1.pseudo;
        document.querySelector("idJoueur2 span").textContent = partie.player2.pseudo;

    } else {
        joueur = player2;
        baliseJoueur = document.getElementById("joueur2");
        baliseAdversaire = document.getElementById("joueur1");
        baliseEspaceJoueur = document.getElementById('espaceJoueur2');
        baliseEspaceAdversaire = document.getElementById('espaceJoueur1');
        baliseConteneurChoixJoueur = document.getElementById('conteneur2');
        baliseScoreJoueur1.textContent = 0;
        baliseScoreJoueur2.textContent = 0;
    }
    document.querySelector("idJoueur1 span").textContent = partie.player1.pseudo;
    document.querySelector("idJoueur2 span").textContent = partie.player2.pseudo;
    baliseScoreJoueur1.textContent = partie.player1.score;
    baliseScoreJoueur2.textContent = partie.player2.score;
    baliseJoueur.setAttribute("display", "flex");
    baliseAdversaire.setAttribute("display", "flex");
    baliseConteneurChoixJoueur.setAttribute("display", "flex");
    //
});

baliseConteneurChoixJoueur.addEventListener('click', (event) => {
    coupJoue = event.target.id;
    console.log(`choix${joueur} `,coupJoue);
    socket.emit(`choix${joueur}`,coupJoue);
    baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
    baliseEspaceJoueur.classList.add(coupJoue);
});

socket.on("affiche-choixJoueur2", (data) => {
    baliseEspaceJoueur2.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
    baliseEspaceJoueur2.classList.add(data);
});





socket.on("reset", (message) => {
    baliseJoueur.setAttribute("display", "none");
    baliseAdversaire.setAttribute("display", "nonex");
    baliseConteneurChoixJoueur.setAttribute("display", "none");
    //afficher message
})

