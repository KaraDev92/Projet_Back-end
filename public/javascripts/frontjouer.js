"use strict"

/** Variables globales
 * @constant {Object} socket - sert à la communication entre le client et le serveur websocket
 * @constant {HTMLElement} baliseForm - balise du formulaire
 * @constant {HTMLElement} baliseScoreJoueur1 - balise affichant le score du joueur 1
 * @constant {HTMLElement} baliseScoreJoueur2 - balise affichant le score du joueur 2
 * @constant {HTMLElement} baliseMessage - balise pour l'espace affichage messages du jeu
 * 
*/
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

/** Envoi le pseudo saisi dans le formulaire
 * @event #submit
 * @callback
 * @param {SubmitEvent} Event
 * @fires #identifier
*/
baliseForm.addEventListener('submit', (event) => {
    const balisePseudo = window.document.getElementById('pseudo');
    event.preventDefault();
    const message = balisePseudo.value.trim();
    socket.emit('identifier',message);
});

/** Informe d'un problème avec le pseudo saisi
 * @event #histoireDePseudo
 * @callback
 * @param {string} data - message à afficher
 */
socket.on("histoireDePseudo", (data) => {
    let p = document.createElement("p");
    p.innerHTML = data;
    baliseForm.appendChild(p);
});

/** Informe de l'attente d'un autre joueur
 * @event #mise-en-attente
 * @callback
 * @param {string} data - message à afficher
 */
socket.on("mise-en-attente", (data) => {
    let p = document.createElement("p");
    p.setAttribute("id", "attente");
    p.innerHTML = data;
    baliseForm.appendChild(p);
});

/** Mise en place du début de la partie
 * @event #debut-partie
 * @callback
 * @param {Object} partie - objet résumant la partie en cours
 */
socket.on("debut-partie", (data) => {
    document.querySelector("#identification").style.display = "none";
    partie = data;
    if (socket.id === partie.player1.id) {
        joueur = "player1";
        baliseJoueur = document.getElementById("joueur1");
        baliseAdversaire = document.getElementById("joueur2");
        baliseEspaceJoueur = document.getElementById('espaceJoueur1');
        baliseEspaceAdversaire = document.getElementById('espaceJoueur2');
        baliseConteneurChoixJoueur = document.getElementById('conteneur1');

        //le addEventListener a besoin de savoir à quoi correspond la balise au chargement de la page, donc il est ici
        /** Envoi du coup joué par le joueur
         * @event #click
         * @callback
         * @param {MouseEvent} event
         * @fires #choix-du-player1
         */
        baliseConteneurChoixJoueur.addEventListener('click', (event) => {
            coupJoue = event.target.id;
            baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
            baliseEspaceJoueur.classList.add(coupJoue);
            socket.emit("choix-du-player1", coupJoue);
        });
    } else {
        joueur = "player2"; 
        baliseJoueur = document.getElementById("joueur2");
        baliseAdversaire = document.getElementById("joueur1");
        baliseEspaceJoueur = document.getElementById('espaceJoueur2');
        baliseEspaceAdversaire = document.getElementById('espaceJoueur1');
        baliseConteneurChoixJoueur = document.getElementById('conteneur2');

        //le addEventListener a besoin de savoir à quoi correspond la balise au chargement de la page, donc il est ici aussi !
                /** Envoi du coup joué par le joueur
         * @event #click
         * @callback
         * @param {MouseEvent} event
         * @fires #choix-du-player2
         */
        baliseConteneurChoixJoueur.addEventListener('click', (event) => {
            coupJoue = event.target.id;
            baliseEspaceJoueur.classList.remove('pierre', 'papier', 'ciseaux', 'spock', 'lezard');
            baliseEspaceJoueur.classList.add(coupJoue);
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

/** Information et re-initialisation si un joueur n'a pas joué 
 * @event #Pas-joue
 * @async
 * @callback
*/
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

/** Affichage coup de l'adversaire
 * @event #Ont-joue
 * @callback
 * @param {Object} partie - objet résumant la partie en cours
 */
socket.on("Ont-joue", (data) => {
    partie = data;
    baliseMessage.textContent = "Les jeux sont faits !"
    if (joueur === "player1") {
        baliseEspaceAdversaire.classList.add(partie.player2.coup);
    } else {
        baliseEspaceAdversaire.classList.add(partie.player1.coup);
    }
});

/** Affichage scores et message sur le gagnant
 * @event #And-the-winner-is
 * @async
 * @callback
 * @param {Object} partie - objet résumant la partie en cours 
 */
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

/** Affichage message en cas de déconnexion de l'adversaire
 * @event #fuiteDeLAdversaire
 * @callback
 * @param {string} message
 */
socket.on("fuiteDeLAdversaire", (message) => {
    baliseMessage.textContent = message;
});

/** Re-initialisation du plateau en attente d'un nouvel adversaire
 * @event #reset
 * @callback
 * @param {string} message
 */
socket.on("reset", (message) => {
    baliseJoueur.style.display = "none";
    baliseAdversaire.style.display = "none";
    baliseConteneurChoixJoueur.style.display = "none";
    baliseMessage.textContent = message;
})

