

const {chercherJoueur, enregistrerScore} = require('./mongodba.js');
const {Partie, quiAgagne } = require('./logique_jeu.js');
const { Server } = require("socket.io");

const tabDesRooms = new Array;

const connectionWS = async function (httpServer) {

        /** Serveur websocket */
    const ioServer = new Server(httpServer); 
   

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
                console.log("résultat quiAgagné 1"); 
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
                        console.log("refroom :" , refRoom);
                        const laRoom =  "room" + indexRoomJeu;
                        socket.join(laRoom);
                        console.log(data, " a rejoint la ", laRoom);
                        ioServer.to(refRoom[0]).emit("demande-info-partie-a-player1", {pseudo : data, id : socket.id});
                    }
                    console.log("tableau des rooms :", tabDesRooms);
                }
            } else {
            socket.emit("histoireDePseudo", "Le pseudo ne doit contenir que des lettres (non accentuées) et/ou des chiffres.");
            }

        });

        socket.on("demande-info-partie-a-player1", (infoJoueur2) => {
            console.log("demande-info-partie-a-player1 reçue");
            if (socket.id = partie.player1.id) {
                console.log("demande-info-partie reçue");
                partie.player2.id = infoJoueur2.id;
                partie.player2.pseudo = infoJoueur2.pseudo;
                console.log("partie avant renvoi au player2", partie);
                ioServer.to(partie.room).emit("retour-info-partie-a-player2", partie);
            }
        });

        socket.on("retour-info-partie-a-player2", (laPartie) => {
            if (socket.id = partie.player2.id) {
            partie = laPartie;
            ioServer.to(partie.room).emit("debut-partie", partie); // à compléter
            }
        });

        // socket.on("l'autre-a-jouéR", (data) => {
        //     partie[data.joueur]["coup"] = data.coupJoue;
        // });

        socket.on("choix-du-player2", (coupP2) => {
            partie.player2.coup = coupP2;
            ioServer.to(partie.player1.id).emit("player2-a-joue", coupP2);
        });

        socket.on("player2-a-joue", (coupP2) => {
            if (socket.id === partie.player1.id) {
                partie.player2.coup = coupP2;
            }
        });
        socket.on("choix-du-player1", async (coupP1) => {
            // if (data.joueur = "player1") {
            //     socket.to(partie.player2.id).emit("l'autre-a-jouéA", data);
            // } else {
            //     socket.to(partie.player1.id).emit("l'autre-a-jouéA", data);
            // }
            partie.player1.coup = coupP1;
            //socket.to(partie.room).emit("l'autre-a-joue", partie);
            console.log("partie renseigné", partie);
            try {
                const resultat = await verifOntJoue(partie);
                console.log("resultat de quiAgagne 2", resultat);
                partie.player1.score += resultat[0];
                partie.player2.score += resultat[1];
                partie.player1.coup = "";
                partie.player2.coup = "";
                await new Promise((resolve, reject) => { 
                    setTimeout(() => {
                        socket.to(partie.room).emit("And-the-winner-is", {partie: partie, message : resultat[2]});
                        resolve();
                        ioServer.to(partie.player2.id).emit("mise-a-jour-partie", partie);
                    }, 2500);
                });
                
            } catch (err) {
                console.log("fonctionne pas ! ", err);
            }

        });

        socket.on("mise-a-jour-partie", (data) => {
            partie = data;
        });

        socket.on("pret", () => {
            socket.emit("debut-partie", partie);
        })

        //gestion erreur !!!
        socket.on('error', (err) => {
            console.log('received error from client:', err);
        });


        socket.on('disconnect', async() => {
            // faire un message du départ du joueur
            // envoyer les scores dans la BDD
            await enregistrerScore(partie.player1.pseudo, partie.player1.score);
            await enregistrerScore(partie.player2.pseudo, partie.player2.score);
            ioServer.to(partie.room).emit("fuiteDeLAdversaire", "Devant votre perspicacité, votre adversaire a fui !");
            //quitte la room
            socket.leave(partie.room);
            // fait le ménage
            socket.removeAllListeners();
            //switcher rôle si besoin
            const indexRoom = parseInt(partie.room.substring(4));
            console.log("car deconnexion retire de la room ", indexRoom);
            if (partie.player1.id === socket.id) {
                partie.player1 = partie.player2;
                // partie.player1.id = partie.player2.id;
                // partie.player1.pseudo = partie.player1.pseudo;
                // partie.player1.score = partie.player2.score;
                // partie.player2.pseudo = "";
                // partie.player2.id = "";
                // partie.player2.score = 0;
                // partie.player2.coup = "";
                socket.to(partie.player1.id).emit("reset", "En attente d'un nouvel adversaire");
                //sortir Id de la room
                if (typeof indexRoom === Number) {
                    tabDesRooms[indexRoom].splice(0,1);
                }
            } else {
                if (typeof indexRoom === Number) {
                    tabDesRooms[indexRoom].pop();
                }
            }
            partie.player2.pseudo = "";
            partie.player2.id = "";
            partie.player2.score = 0;
            partie.player2.coup = "";
            console.log(tabDesRooms);
            
            // tabDesRooms.forEach((room) => {
            //     const indexRoomFinJeu = room.findIndex((elmt) => elmt === socket.id);
            //     if (indexRoomFinJeu > -1) {
            //         room.splice(indexRoomFinJeu,1);
            //         console.log(tabDesRooms);
            //     }
            // });
            
            console.log("un client s'est déconnecté");
        });


    });

    









};

module.exports = connectionWS;