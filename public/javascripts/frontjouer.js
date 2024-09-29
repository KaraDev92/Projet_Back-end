"use strict"

// eslint-disable-next-line no-undef
const socket = io();

const baliseForm = window.document.getElementById('formulaire');
let baliseJoueur = null;
let baliseAdversaire = null;
let baliseConteneurChoixJoueur = null;
let baliseEspaceJoueur = null;
let baliseEspaceAdversaire = null;
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
        //le addEventListener a besoin de savoir à quoi correspond la balise au chargement de la page, donc il est ici
        baliseConteneurChoixJoueur.addEventListener('click', (event) => {
            coupJoue = event.target.id;
            baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
            baliseEspaceJoueur.classList.add(coupJoue);
            console.log(`choix ${joueur} `,coupJoue);
            socket.emit("choix-du-player1", coupJoue);
        });
    } else {
        joueur = "player2"; 
        console.log('sur les balises joueur 2');
        baliseJoueur = document.getElementById("joueur2");
        baliseAdversaire = document.getElementById("joueur1");
        baliseEspaceJoueur = document.getElementById('espaceJoueur2');
        baliseEspaceAdversaire = document.getElementById('espaceJoueur1');
        baliseConteneurChoixJoueur = document.getElementById('conteneur2');
        //le addEventListener a besoin de savoir à quoi correspond la balise au chargement de la page, donc il est ici aussi !
        baliseConteneurChoixJoueur.addEventListener('click', (event) => {
            coupJoue = event.target.id;
            baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
            baliseEspaceJoueur.classList.add(coupJoue);
            console.log(`choix ${joueur} `,coupJoue);
            socket.emit("choix-du-player2", coupJoue);
        });
    }
    baliseMessage.textContent = "Vous avez 10s. pour jouer !";
    baliseJoueur.style.display = "flex";
    baliseAdversaire.style.display = "flex";
    baliseConteneurChoixJoueur.style.display = "grid";
    document.querySelector("#idJoueur1 span").textContent = partie.player1.pseudo;
    document.querySelector("#idJoueur2 span").textContent = partie.player2.pseudo;
    baliseScoreJoueur1.textContent = partie.player1.score;
    baliseScoreJoueur2.textContent = partie.player2.score;
});

socket.on("Pas-joue", async () => {
    try {
        baliseMessage.textContent = "Temps dépassé !"
        // eslint-disable-next-line no-unused-vars
        await new Promise((resolve, reject) => { 
            setTimeout(() => {
                socket.emit("pret");
                baliseEspaceAdversaire.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
                baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
                resolve();
            }, 2500);
        });
    } catch (error) { 
        console.log("problème de setTimeout !", error);
    }
});

socket.on("Ont-joue", (data) => {
    partie = data;
    baliseMessage.textContent = "Les jeux sont faits !"
    if (joueur === "player1") {
        baliseEspaceAdversaire.classList.add(partie.player2.coup);
    } else {
        baliseEspaceAdversaire.classList.add(partie.player1.coup);
    }
});

socket.on("And-the-winner-is", async (data) => {
    try {
        partie = data.partie;
        baliseScoreJoueur1.innerText = partie.player1.score;
        baliseScoreJoueur2.innerText = partie.player2.score;
        baliseMessage.textContent = data.message;
    
        // eslint-disable-next-line no-unused-vars
        await new Promise((resolve, reject) => { 
            setTimeout(() => {
                socket.emit("pret");
                baliseEspaceAdversaire.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
                baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
                resolve();
            }, 2500);
        });
    } catch (error) {
        console.log("problème de setTimeout !", error);
    }
});

socket.on("fuiteDeLAdversaire", (message) => {
    baliseMessage.textContent = message;
});

socket.on("Jeu-en-panne", () => {
    baliseMessage.textContent = "Nous rencontrons un problème, merci de revenir ultérieurement.";
});

socket.on("reset", (message) => {
    baliseJoueur.style.display = "none";
    baliseAdversaire.style.display = "none";
    baliseConteneurChoixJoueur.style.display = "none";
    baliseMessage.textContent = message;
})

