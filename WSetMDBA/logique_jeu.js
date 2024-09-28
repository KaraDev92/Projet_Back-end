"use strict"

 
const { reglesJeu } = require("../variables");

class Partie {  //est appelée par le serveur WS pour instanciation lors de l'ouverture d'une nouvelle room
    constructor() {
        this.room = "";
        this.player1 = {
            id: "",
            pseudo: "",
            score: 0,
            coup: ""
        };
        this.player2 = {
            id: "",
            pseudo: "",
            score: 0,
            coup: ""
        }
    }
}

function quiAgagne (laPartie) {
    let scoreP1, scoreP2, message;
    const partie = laPartie;
    const resultat = reglesJeu[partie.player1.coup][partie.player2.coup];
    switch (resultat[0]) {
        case "E":
            scoreP1 = 0;
            scoreP2 = 0;
            break;
        case 0:
            scoreP1 = 0;
            scoreP2 = 1;
            break;
        case 1:
            scoreP1 = 0;
            scoreP2 = 1;
            break;
    }
    message = resultat[1];
    return ([scoreP1, scoreP2, message])
};

module.exports.Partie = Partie;
module.exports.quiAgagne = quiAgagne;