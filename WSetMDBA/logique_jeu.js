"use strict"

 /** Module exporté logique_jeu
  * @module logique_jeu
  * @requires module:variables
  */
const { reglesJeu } = require("../variables");


/**pour créer une partie
 * @class Partie
 */
class Partie {
    constructor() {
        /**
         * @type {string}
         */
        this.room = "";
         /**
         * @type {object}
         * @property {string} id - référence au socket.id du joueur
         * @property {string} pseudo - pseudo du joueur
         * @property {number} score - score du joueur
         * @property {string} coup - coup joué par le joueur
         */       
        this.player1 = {
            /** 
             * @alias player1.id
             * @memberof! Partie#
             */
            id: "",
            /** 
             * @alias player1.pseudo
             * @memberof! Partie#
             */
            pseudo: "",
            /** 
             * @alias player1.score
             * @memberof! Partie#
             */
            score: 0,
            /** 
             * @alias player1.coup
             * @memberof! Partie#
             */
            coup: ""
        };
         /**
         * @type {object}
         * @property {string} id - référence au socket.id du joueur
         * @property {string} pseudo - pseudo du joueur
         * @property {number} score - score du joueur
         * @property {string} coup - coup joué par le joueur
         */
        this.player2 = {
            /** 
             * @alias player2.id
             * @memberof! Partie#
             */
            id: "",
            /** 
             * @alias player2.pseudo
             * @memberof! Partie#
             */
            pseudo: "",
            /** 
             * @alias player2.score
             * @memberof! Partie#
             */
            score: 0,
            /** 
             * @alias player2.coup
             * @memberof! Partie#
             */
            coup: ""
        }
    }
}

/** fonction comparant les coups et définissant le vainqueur
 *
 * @function quiAgagne
 * @param {Object} laPartie - objet résumant la partie en cours
 * @return {Array} - tableau comprenant le score du joueur 1, le score du joueur 2 et le message pour cette partie
 */
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
            scoreP1 = 1;
            scoreP2 = 0;
            break;
    }
    message = resultat[1];
    return ([scoreP1, scoreP2, message])
};

module.exports.Partie = Partie;
module.exports.quiAgagne = quiAgagne;