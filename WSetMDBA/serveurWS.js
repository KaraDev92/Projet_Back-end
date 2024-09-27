
"use strict"

const { phrasesJeu, reglesJeu } = require('../variables.js');
const {chercherJoueur, enregistrerScore} = require('./mongodba.js');
const {Partie, quiAgagne } = require('./logique_jeu.js');

const tabDesRooms = [];

const connectionWS = function (httpServer) {

        /** Serveur websocket */
    const ioServer = require("socket.io")(httpServer);

    // fonction pour vérifier conformité du pseudo
    function conformitePseudo(data) {
    const regex = /^[a-z0-9]{4,}$/i;
    console.log("test de conformité : " ,regex.test(data));
    return regex.test(data)
    };

    // vérification que les 2 joueurs ont joué
    async function verifOntJoue (partie) {
       return new Promise((resolve, reject) => {
        let i=0;
        let idDuSI = setInterval (() => {
            if (partie.player1.coup && partie.player2.coup) {
                ioServer.to(partie.room).emit("Ont-joue", partie);
                const resultat = quiAgagne(partie);
                console.log("résultat qui Agagné 1"); 
                clearInterval(idDuSI);
                resolve(resultat);
            }
            i++;
            if (i===10) {
                reject("Un des 2 joueurs n'a pas joué");
                clearInterval(idDuSI);
            }
        }, 1000);
       });
    }

    //connection WS
    ioServer.on('connection', (socket) => {
        console.log("Un client s'est connecté");
    //créer une instance de classe partie
        let partie  = new Partie();  
        //identifier le pseudo saisi
        socket.on("identifier", async(data) => { //catch erreur
            console.log(data);
            if(conformitePseudo(data)) {    //vérification conformité et identifier le pseudo saisi
                const answer = await chercherJoueur(data);
                console.log("answer : ", answer);
                if (answer) {
                    socket.emit("histoireDePseudo", "Ce pseudo est déjà pris !");
                } else {                    //et identifier le pseudo saisi
                    let indexRoomJeu = tabDesRooms.findIndex((room) => room.length < 2);
                    if(indexRoomJeu === -1) {
                        const idx = (tabDesRooms.push([socket.id]) - 1);
                        const laRoom =  "room" + idx;
                        socket.join(laRoom);
                        partie.player1.pseudo = data;
                        partie.player1.id = socket.id;                       
                        partie.room = laRoom;
                        console.log(data, " a rejoint la ", laRoom);
                        socket.emit("mise-en-attente", "En attente d'un autre joueur ...");
                    } else {
                        const refRoom = tabDesRooms[indexRoomJeu];
                        refRoom.push(socket.id);
                        const laRoom =  "room" + indexRoomJeu;
                        socket.join(laRoom);
                        console.log(data, " a rejoint la ", laRoom);
                        socket.to(refRoom[0]).emit("demande-info-partieA", {pseudo : data, id : socket.id});
                    }
                    console.log(tabDesRooms);
                }
            } else {
            socket.emit("histoireDePseudo", "Le pseudo ne doit contenir que des lettres (non accentuées) et/ou des chiffres.");
            }

        });

        socket.on("demande-info-partieR", (infoJoueur2) => {
            console.log("demande-info-partie reçue");
            partie.player2.id = infoJoueur2.id;
            partie.player2.pseudo = infoJoueur2.pseudo;
            console.log("partie avant renvoi au player2", partie);
            ioServer.to(partie.room).emit("retour-info-partieA", partie);
        });

        socket.on("retour-info-partieR", (laPartie) => {
            partie = laPartie;
            ioServer.to(partie.room).emit("debut-partie", partie); // à compléter
        });

        socket.on("l'autre-a-jouéR", (data) => {
            partie[data.joueur]["coup"] = data.coupJoue;
        });

        socket.on("choix-du-joueur", async (data) => {
            if (data.joueur = "player1") {
                socket.to(partie.player2.id).emit("l'autre-a-jouéA", data);
            } else {
                socket.to(partie.player1.id).emit("l'autre-a-jouéA", data);
            }
            partie[data.joueur]["coup"] = data.coupJoue;
            console.log("partie renseigné", partie);
            try {
                const resultat = await verifOntJoue(partie);
                console.log("resultat de quiAgagne 2");
                partie.player1.score += resultat[0];
                partie.player2.score += resultat[1];
                partie.player1.coup = "";
                partie.player2.coup = "";
                await new Promise((resolve, reject) => { 
                    setTimeout(() => {
                        ioServer.to(partie.room).emit("And-the-winner-is", {partie: partie, message : resultat[2]});
                        resolve();
                    }, 2500);
                });
                
            } catch (err) {
                console.log(err);
            }

        });

        // socket.on("choixJoueur2", (data) => {
        //     socket.emit("affiche-choixJoueur2", data);
        // });

        // socket.emit("event2", "Message envoyé du serveur vers le client");

        // socket.join('le groupe');
        // ioServer.to('le groupe').emit('un identifiant', 'un message');

        //gestion erreur !!!


        socket.on('disconnect', () => {
            // faire un message du départ du joueur

            // envoyer score dans BDD

            //sortir Id de la room
            tabDesRooms.forEach(async(room) => {

                // envoyer les scores dans la BDD
                await enregistrerScore(partie.player1.pseudo, partie.player1.score);
                await enregistrerScore(partie.player2.pseudo, partie.player2.score);
                ioServer.to(partie.room).emit("fuiteDeLAdversaire", "Devant votre perspicacité, votre adversaire a fui !");

                if (partie.player1.id === socket.id) {
                    partie.player1 = partie.player2;
                    // partie.player1.id = partie.player2.id;
                    // partie.player1.pseudo = partie.player1.pseudo;
                    // partie.player1.score = partie.player2.score;
                    partie.player2.pseudo = "";
                    partie.player2.id = "";
                    partie.player2.score = 0;
                    partie.player2.coup = "";
                    socket.to(partie.player2.id).emit("reset", "En attente d'un nouvel adversaire");
                } else {
                    partie.player2.pseudo = "";
                    partie.player2.id = "";
                    partie.player2.score = 0;
                    partie.player2.coup = "";
                }

                const indexRoomFinJeu = room.findIndex((elmt) => elmt === socket.id);
                if (indexRoomFinJeu > -1) {
                    room.splice(indexRoomFinJeu,1);
                    console.log(tabDesRooms);
                }
            });
            
            console.log("un client s'est déconnecté");
        });


    });

    









};

module.exports = connectionWS;