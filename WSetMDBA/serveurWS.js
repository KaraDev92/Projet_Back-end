
"use strict"

const { phrasesJeu, reglesJeu } = require('../variables.js');
const chercherJoueur = require('./mongodba.js');
const enregistrerScore = require('./mongodba.js');
const Partie = require('./logique_jeu.js');

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

    //connection XS
    ioServer.on('connection', (socket) => {
        console.log("Un client s'est connecté");
    //créer une instance de classe partie
        // let joueur1 = { pseudo: "", score: 0, room: "", id: ""}; // fiche du player1
        // let joueur2 = { pseudo: "", score: 0, room: "", id: ""}; // fiche du player2
        const partie  = new Partie();  
        //identifier le pseudo saisi
        socket.on("identifier", async(data) => { //catch erreur
            console.log(data);
            if(conformitePseudo(data)) {    //vérification conformité et identifier le pseudo saisi
                const answer = await chercherJoueur(data);
                console.log("answer : ", answer);
                if (answer) {
                    socket.emit("histoireDePseudo", "Ce pseudo est déjà pris !");
                } else {                    //et identifier le pseudo saisi
                    // joueur1.pseudo = data;
                    // joueur1.id = socket.id;
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
                        //const laRoom = "room" + indexRoomJeu;
                        //joueur2.id = refRoom[0];
                        socket.to(refRoom[0]).emit("demande-info-partie", {pseudo : data, id : socket.id});
                    }
                    console.log(tabDesRooms);
                }
            } else {
            socket.emit("histoireDePseudo", "Le pseudo ne doit contenir que des lettres (non accentuées) et/ou des chiffres.");
            }

        });

        socket.on("demande-info-partie", (infoJoueur2) => {
            partie.player2.id = infoJoueur2.id;
            partie.player2.pseudo = infoJoueur2.pseudo;
            // joueur2.pseudo = infoJoueur2.pseudo;
            // joueur2.room = infoJoueur2.room;
            // joueur1.room = infoJoueur2.room;
            // joueur2.id = infoJoueur2.id;
            socket.to(partie.player2.id).emit("retour-info-partie", partie);
        });

        socket.on("retour-info-partie", (laPartie) => {
            partie = laPartie;
            // joueur2.pseudo = infoJoueur2.pseudo;
            // joueur2.room = infoJoueur2.room;
            // joueur1.room = infoJoueur2.room;
            console.log(partie.player2.pseudo, " a rejoint la ", partie.room);
            ioServer.to(laRoom).emit("debut-partie", partie); // à compléter
        });

        socket.on("choixJoueur1", (data) => {
            socket.broadcast.to(joueur1.room).emit("choixJoueur2", data);
        });

        socket.on("choixJoueur2", (data) => {
            socket.emit("affiche-choixJoueur2", data);
        });

        // socket.emit("event2", "Message envoyé du serveur vers le client");

        // socket.join('le groupe');
        // ioServer.to('le groupe').emit('un identifiant', 'un message');

        //gestion erreur !!!


        socket.on('disconnect', () => {
            // faire un message du départ du joueur

            // envoyer score dans BDD

            //sortir Id de la room
            tabDesRooms.forEach((room) => {

                // envoyer les scores dans la BDD
                enregistrerScore(partie.player1.pseudo, partie.player1.score);
                enregistrerScore(partie.player2.pseudo, partie.player2.score);
                ioServer.to(partie.room).emit("fuiteDeLAdversaire", "Devant votre perspicacité, votre adversaire a fui !");

                if (partie.player1.id === socket.id) {
                    partie.player1.id = partie.player2.id;
                    partie.player1.pseudo = partie.player1.pseudo;
                    partie.player1.score = partie.player2.score;
                    partie.player2.pseudo = "";
                    partie.player2.id = "";
                    partie.player2.score = 0;
                    partie.player2.coup = "";
                    socket.to(player2.id).emit("reset", "En attente d'un nouvel adversaire");
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