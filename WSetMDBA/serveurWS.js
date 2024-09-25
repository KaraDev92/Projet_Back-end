
"use strict"

const { phrasesJeu, reglesJeu } = require('../variables.js');
const chercherJoueur = require('./mongodba.js');

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

        //identifier le pseudo saisi
        socket.on("identifier", async(data) => {
            console.log(data);
            if(conformitePseudo(data)) {
                const answer = await chercherJoueur(data);
                console.log("answer : ", answer);
                if (answer) {
                    socket.emit("histoireDePseudo", "Ce pseudo est déjà pris !");
                } else {
                    let indexRoomJeu = tabDesRooms.findIndex((room) => room.length < 2);
                    if(indexRoomJeu === -1) {
                        const idx = (tabDesRooms.push([socket.id]) - 1);
                        const laRoom =  "room" + idx;
                        socket.join(laRoom);
                        console.log(data, " a rejoint la ", laRoom);
                        socket.emit("mise-en-attente", "En attente d'un autre joueur ...")
                    } else {
                        tabDesRooms[indexRoomJeu].push(socket.id);
                        const laRoom = "room" + indexRoomJeu;
                        socket.join(laRoom);
                        ioServer.to(laRoom).emit("début partie"); // à compléter
                        //socket.emit("lancerPartie" ) ?
                        //supprimer le p de mise en attente
                        console.log(data, " a rejoint la ", laRoom);
                    }
                    console.log(tabDesRooms);

                }
            } else {
            socket.emit("histoireDePseudo", "Le pseudo ne doit contenir que des lettres (non accentuées) et/ou des chiffres.");
            }

        });

        // socket.emit("event2", "Message envoyé du serveur vers le client");

        // socket.join('le groupe');
        // ioServer.to('le groupe').emit('un identifiant', 'un message');

        //gestion erreur !!!


        socket.on('disconnect', () => {
            //sortir Id de la room
            tabDesRooms.forEach((room) => {
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