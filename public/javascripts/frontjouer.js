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
const baliseScoreJoueur1 = document.querySelector("#scoreJoueur1 span");
const baliseScoreJoueur2 = document.querySelector("#scoreJoueur2 span");
const baliseMessage = document.getElementById('espace-message');

let partie = {};
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

socket.on("demande-info-partieA", (data) => {
    socket.emit("demande-info-partieR", data);
});

socket.on("retour-info-partieA", (data) => {
    socket.emit("retour-info-partieR", data);
});


socket.on("debut-partie", (data) => {
    document.querySelector("#identification").style.display = "none";
    partie = data;
    if (socket.id === partie.player1.id) {
        joueur = "player1";
        console.log('sur les balises joueur 1');
        baliseJoueur = document.getElementById("joueur1");
        baliseAdversaire = document.getElementById("joueur2");
        baliseEspaceJoueur = document.getElementById('espaceJoueur1');
        baliseEspaceAdversaire = document.getElementById('espaceJoueur2');
        baliseConteneurChoixJoueur = document.getElementById('conteneur1');
        baliseConteneurChoixJoueur.addEventListener('click', (event) => {
            coupJoue = event.target.id;
            console.log(`choix ${joueur} `,coupJoue);
            socket.emit("choix-du-joueur", {joueur: joueur, coupJoue: coupJoue});
            baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
            baliseEspaceJoueur.classList.add(coupJoue);
        });
    } else {
        joueur = "player2"; 
        console.log('sur les balises joueur 2');
        baliseJoueur = document.getElementById("joueur2");
        baliseAdversaire = document.getElementById("joueur1");
        baliseEspaceJoueur = document.getElementById('espaceJoueur2');
        baliseEspaceAdversaire = document.getElementById('espaceJoueur1');
        baliseConteneurChoixJoueur = document.getElementById('conteneur2');
        baliseConteneurChoixJoueur.addEventListener('click', (event) => {
            coupJoue = event.target.id;
            console.log(`choix ${joueur} `,coupJoue);
            socket.emit("choix-du-joueur", {joueur: joueur, coupJoue: coupJoue});
            baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
            baliseEspaceJoueur.classList.add(coupJoue);
        });
    }
    baliseMessage.innerText = "À vous de jouer !";
    baliseJoueur.style.display = "flex";
    baliseAdversaire.style.display = "flex";
    baliseConteneurChoixJoueur.style.display = "grid";
    document.querySelector("#idJoueur1 span").textContent = partie.player1.pseudo;
    document.querySelector("#idJoueur2 span").textContent = partie.player2.pseudo;
    baliseScoreJoueur1.textContent = partie.player1.score;
    baliseScoreJoueur2.textContent = partie.player2.score;
    //
});

// baliseConteneurChoixJoueur.addEventListener('click', (event) => {
//     coupJoue = event.target.id;
//     console.log(`choix ${joueur} `,coupJoue);
//     socket.emit("choix du joueur", {joueur: joueur, coupeJoue: coupJoue});
//     baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
//     baliseEspaceJoueur.classList.add(coupJoue);
// });

// socket.on("affiche-choixJoueur2", (data) => {
//     baliseEspaceJoueur2.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
//     baliseEspaceJoueur2.classList.add(data);
// });
socket.on("l'autre-a-jouéA", (data) => {
    socket.emit("l'autre-a-jouéA", data);
});

socket.on("Ont-joue", (data) => {
    partie = data;
    baliseMessage.innerText = "Les jeux sont faits !"
    if (joueur = "player1") {
        baliseEspaceAdversaire.classList.add(partie.player2.coup);
    } else {
        baliseEspaceAdversaire.classList.add(partie.player1.coup);
    }
});

socket.on("And-the-winner-is", (data) => {
    partie = data.partie;
    baliseScoreJoueur1.innerText = partie.player1.score;
    baliseScoreJoueur2.innerText = partie.player2.score;
    baliseMessage.innerText = data.message;
    //baliseEspaceAdversaire.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
    //baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
})



socket.on("reset", (message) => {
    baliseJoueur.style.display = none;
    baliseAdversaire.style.display = none;
    baliseConteneurChoixJoueur.style.display = none;
    //afficher message
})

