"use strict"

/**Modules importés 
 * @module serveurWS
 * @requires module:mongodba
 * @requires module:logique_jeu
*/
const {chercherJoueur, enregistrerScore} = require('./mongodba.js');
const {Partie, quiAgagne } = require('./logique_jeu.js');
const { Server } = require("socket.io");

/** Variable globale
 * @constant {Array.<Partie>} tabDesRooms - tableau qui comprendra toutes les instances de Partie en cours
 * */
const tabDesRooms = new Array;

/** fonction générant une connexion websocket pour un client
 * @async
 * @function connectionWS
 * @param {http.Server} httpServer - serveur HTTP de l'appli
 */
const connectionWS = async function (httpServer) {

    /** Serveur websocket 
     * @constant {Server} ioServer - instance de serveur websocket
     */
    const ioServer = new Server(httpServer);

    /** Fonction pour vérifier la conformité du pseudo
     * @function conformitePseudo
     * @param {string} data
     * @return {boolean} 
     */
    function conformitePseudo(data) {
    const regex = /^[a-z0-9]{4,}$/i;
    return regex.test(data)
    };

    
    /** fonction de vérification que les 2 joueurs ont joué
     * @async
     * @function verifOntJoue
     * @param {Object} partie - objet résumant la partie en cours
     * @fires #Ont-joue
     * @fires #Pas-joue
     * @returns {Promise<Array>} - tableau comprenant le score du joueur 1, le score du joueur 2 et le message pour cette partie
     */
    async function verifOntJoue (partie) {
        try {
            return await new Promise((resolve, reject) => {
                let i=0;
                let idDuSI = setInterval (() => {
                    if (partie.player1.coup && partie.player2.coup) {
                        ioServer.to(partie.room).emit("Ont-joue", partie);
                        const resultat = quiAgagne(partie);
                        clearInterval(idDuSI);
                        resolve(resultat);
                    }
                    i++;
                    if (i===10) {
                        reject("Un des 2 joueurs n'a pas joué");
                        clearInterval(idDuSI);
                        ioServer.to(partie.room).emit("Pas-joue");
                    }
                }, 1000);
            });
        } catch (error) {
            console.log("comparaison des résultats en panne : ",error);
        }
    };

    /** Événement connexion WS
     * @event #connection
     * @callback
     * @param {Socket} socket - référence de l'instance de connection WS
     */
    ioServer.on('connection', (socket) => {
        console.log("Un client s'est connecté");

        //créer une instance de classe partie
        let partie  = new Partie();

        /** déclenchement vérification pseudo puis instanciation d'une partie ou rejoint une partie existante
         * @event #identifier
         * @callback
         * @param {string} data - pseudo saisi par le client
         * @fires #histoireDePseudo
         * @fires #mise-en-attente
         * @fires #debut-partie
        */
        socket.on("identifier", async(data) => {
            try {
                if(conformitePseudo(data)) {    
                    const answer = await chercherJoueur(data);
                    if (answer) {
                        socket.emit("histoireDePseudo", "Ce pseudo est déjà pris !");
                    } else {
                        //et identifier le pseudo saisi
                        let indexRoomJeu = tabDesRooms.findIndex((room) => room.player2.id === "");
                        if(indexRoomJeu === -1) {
                            const idx = (tabDesRooms.push(partie) - 1);
                            const laRoom = "room" + idx;
                            socket.join(laRoom);
                            tabDesRooms[idx].player1.pseudo = data;
                            tabDesRooms[idx].player1.id = socket.id;
                            tabDesRooms[idx].room = laRoom;
                            console.log(data, " a rejoint la ", laRoom);
                            socket.emit("mise-en-attente", "En attente d'un autre joueur ...");
                        } else {
                            tabDesRooms[indexRoomJeu].player2.pseudo = data;
                            tabDesRooms[indexRoomJeu].player2.id = socket.id;
                            const laRoom = "room" + indexRoomJeu;
                            socket.join(laRoom);
                            console.log(data, " a rejoint la ", laRoom);
                            partie = tabDesRooms[indexRoomJeu];
                            ioServer.to(laRoom).emit("debut-partie", partie);
                        }
                    }
                } else {
                socket.emit("histoireDePseudo", "Le pseudo ne doit contenir que des lettres (non accentuées) et/ou des chiffres.");
                }
            } catch (err) {
                console.log("Erreur dans l'identification du pseudo :", err);
                socket.emit("histoireDePseudo", "Nous rencontrons un problème, merci de revenir ultérieurement.");
            }
        });

        /** Récupère le coup joué par le joueur 2
         * @event #choix-du-player2
         * @callback
         * @param {string} coupP2 - coup joué par le joueur 2
        */
        socket.on("choix-du-player2", (coupP2) => {
            let indexRoomJeu = tabDesRooms.findIndex((room) => room.player2.id === socket.id);
            tabDesRooms[indexRoomJeu].player2.coup = coupP2;
        });

        /** Récupère le coup joué par le joueur 1 et déclenche la comparaison
         * @event choix-du-player1
         * @async
         * @callback
         * @param {string} coupP1 - coup joué par le joueur 1
         * @fires #And-the-winner-is
        */
        socket.on("choix-du-player1", async (coupP1) => {
            let indexRoomJeu = tabDesRooms.findIndex((room) => room.player1.id === socket.id);
            tabDesRooms[indexRoomJeu].player1.coup = coupP1;
            partie = tabDesRooms[indexRoomJeu];
            try {
                const resultat = await verifOntJoue(partie);
                tabDesRooms[indexRoomJeu].player1.score += resultat[0];
                tabDesRooms[indexRoomJeu].player2.score += resultat[1];
                tabDesRooms[indexRoomJeu].player1.coup = "";
                tabDesRooms[indexRoomJeu].player2.coup = "";
                await new Promise((resolve) => {
                    setTimeout(() => {
                        ioServer.to(partie.room).emit("And-the-winner-is", {partie: tabDesRooms[indexRoomJeu], message : resultat[2]});
                        resolve();
                    }, 2500);
                });
            } catch (err) {
                console.log("Rendu résultats fonctionne pas ! ", err);
            }
        });

        /** Quand les joueurs sont prêts à jouer de nouveau
         * @event #pret
         * @callback
         * @fires #debut-partie
         * @param {Object} partie - objet résumant la partie en cours
         */
        socket.on("pret", () => {
            socket.emit("debut-partie", partie);
        })

        /** En cas de réception d'une erreur WS du client
         * @event #error
         * @param {Error} err
         */
        socket.on('error', (err) => {
            console.log('received error from client:', err);
        });

        //gestion déconnexion d'un joueur
        /** Gestion de la déconnexion d'un joueur : enregistrer scores et mise à jour partie et tabDesRooms
         * @event #disconnect
         * @async
         * @callback
         * @fires #fuiteDeLAdversaire
         * @fires #reset
        */
        socket.on('disconnect', async() => {
            try {
                let indexRoomJeu = tabDesRooms.findIndex((room) => room.player1.id === socket.id || room.player2.id === socket.id);
                if (indexRoomJeu === -1) {
                    //s'il n'était pas enregistré dans une partie
                    console.log("un client s'est déconnecté");
                } else {
                    // envoyer les scores dans la BDD
                    await enregistrerScore(tabDesRooms[indexRoomJeu].player1.pseudo, tabDesRooms[indexRoomJeu].player1.score);
                    await enregistrerScore(tabDesRooms[indexRoomJeu].player2.pseudo, tabDesRooms[indexRoomJeu].player2.score);

                    //informe l'autre joueur du départ de l'adversaire
                    ioServer.to(tabDesRooms[indexRoomJeu].room).emit("fuiteDeLAdversaire", "Devant votre perspicacité, votre adversaire a fui !");

                    // supprime l'écoute d'événements sur ce socket
                    socket.removeAllListeners();

                    //switcher le rôle du joueur 1 si besoin
                    if (tabDesRooms[indexRoomJeu].player1.id === socket.id) {
                        console.log(tabDesRooms[indexRoomJeu].player1.pseudo, " s'est déconnecté de la room ", indexRoomJeu);
                        if (tabDesRooms[indexRoomJeu].player2.id === "") {
                            tabDesRooms.splice(indexRoomJeu, 1);
                        } else {
                            //player 2 devient player 1
                            tabDesRooms[indexRoomJeu].player1.id = tabDesRooms[indexRoomJeu].player2.id;
                            tabDesRooms[indexRoomJeu].player1.pseudo = tabDesRooms[indexRoomJeu].player2.pseudo;
                            tabDesRooms[indexRoomJeu].player1.score = tabDesRooms[indexRoomJeu].player2.score;                         
                        }
                    } else {
                        console.log(tabDesRooms[indexRoomJeu].player2.pseudo, " s'est déconnecté de la room ", tabDesRooms[indexRoomJeu].room);
                    }
                    //quitte la room
                    socket.leave(tabDesRooms[indexRoomJeu].room);
                    //envoie message de reset
                    // eslint-disable-next-line no-unused-vars
                    await new Promise((resolve, reject) => { 
                        setTimeout(() => {
                            socket.to(tabDesRooms[indexRoomJeu].player1.id).emit("reset", "En attente d'un nouvel adversaire");
                            resolve();
                        }, 2500);
                    });
                    
                    //reset le player 2
                    tabDesRooms[indexRoomJeu].player2.pseudo = "";
                    tabDesRooms[indexRoomJeu].player2.id = "";
                    tabDesRooms[indexRoomJeu].player2.score = 0;
                    tabDesRooms[indexRoomJeu].player2.coup = "";
                    console.log(tabDesRooms);
                }
        } catch (error) {
                console.log("gestion déconnexion en panne :", error);
        }
        });
    });
};

module.exports = connectionWS;