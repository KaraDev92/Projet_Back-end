"use strict"

const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();
const uri = process.env.MONGODB_CONNECTION_STRING;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

//fonction rechercher leaderboard
async function chercherLeaderboard() {
    try {
      await client.connect();
      const database = client.db('projet_back-end');
      const joueurs = database.collection('chifoumi');
      const options = { projection: { _id: 0, pseudo: 1, score:1} };
      const cursor = joueurs.find({}, options).sort({score:-1});
      const leaderboard = await cursor.toArray();
      return leaderboard;
    } catch (error){
      console.log('chercher leaderboard :', error);
      return [{pseudo: '---', score: '---'}];
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  };

// fonction connection et recherche joueur existant dans la base Atlas
const chercherJoueur = async function (nom) {
    try {
        await client.connect();
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
        console.log('chercher joueur BDD : ', error);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
};


const purgerBDDdesZero = async function() {
   // const client = new MongoClient(uri); 
    //la connexion se fait à la création de la variable donc besoin de la mettre dans la fonction c'est à dire quand on utilise vraiment la connection
    try {
        await client.connect();
        const database = client.db('projet_back-end');
        const joueurs = database.collection('chifoumi');
        await joueurs.deleteMany({score : 0});
        console.log("ménage fait dans le leaderboard");
    } catch (error){
        console.log('purger les 0 :', error);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

const enregistrerScore = async function (pseudo, score) {
    try {
        await client.connect();
        const database = client.db('projet_back-end');
        const joueurs = database.collection('chifoumi');
        joueurs.updateOne({pseudo: pseudo}, {$set: {score: score}}, {upsert : true});
    } catch (error){
        console.log('enregistrer score :', error);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
};

module.exports.chercherLeaderboard = chercherLeaderboard;
module.exports.chercherJoueur = chercherJoueur;
module.exports.purgerBDDdesZero = purgerBDDdesZero;
module.exports.enregistrerScore = enregistrerScore;