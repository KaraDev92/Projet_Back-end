"use strict"

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

module.exports = Partie;