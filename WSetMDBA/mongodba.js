"use strict"

const { MongoClient } = require("mongodb");
require('dotenv').config();
const uri = process.env.MONGODB_CONNECTION_STRING;


// fonction connection et recherche joueur existant dans la base Atlas
const chercherJoueur = async function (nom) {

    const client = new MongoClient(uri); 
    //la connexion se fait à la création de la variable donc besoin de la mettre dans la fonction c'est à dire quand on utilise vraiment la connection
    try {
        const database = client.db('projet_back-end');
        const joueurs = database.collection('chifoumi');
        const options = { projection: { _id: 0, pseudo: 1}};
        const cursor = await joueurs.findOne({pseudo : nom}, options);
        console.log("joueur trouvé :", cursor);
        if (cursor === null) {
            joueurs.insertOne({pseudo: nom, score: 0});
            return false
        } else {
            return true
        }
    } catch (error){
        console.dir(error);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
};


const purgerBDDdesZero = async function() {
    const client = new MongoClient(uri); 
    //la connexion se fait à la création de la variable donc besoin de la mettre dans la fonction c'est à dire quand on utilise vraiment la connection
    try {
        const database = client.db('projet_back-end');
        const joueurs = database.collection('chifoumi');
        await joueurs.deleteMany({score : 0});
        console.log("ménage fait dans le leaderboard");
    } catch (error){
        console.dir(error);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

module.exports = chercherJoueur;
module.exports = purgerBDDdesZero;