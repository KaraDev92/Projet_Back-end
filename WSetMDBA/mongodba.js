"use strict"


/** module MongoDB 
 * @module mongodba 
 * */

const { MongoClient, ServerApiVersion } = require("mongodb");

require('dotenv').config();

/** variables connexion à MongoDB Atlas
 * @constant {url} uri - url de connexion à la base de données
 * @constant {Object} client - instance de client MongoDB
 * @constant {Db} database - référence de la base de données
 * @constant {Collection<Document>} joueurs - référence de la collection
 * */
// eslint-disable-next-line no-undef
const uri = process.env.MONGODB_CONNECTION_STRING;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const database = client.db('projet_back-end');
const joueurs = database.collection('chifoumi');

/**fonction pour récupérer le leaderboard
 * @async
 * @function chercherLeaderboard
 * @returns {Array} leaderboard - extraction de la base de données
 */
async function chercherLeaderboard() {
    try {
      await client.connect();
      const options = { projection: { _id: 0, pseudo: 1, score:1} };
      const cursor = joueurs.find({}, options).sort({score:-1});
      const leaderboard = await cursor.toArray();
      return leaderboard;
    } catch (error){
      console.log('chercher leaderboard :', error);
      return [{pseudo: '---', score: '---'}];
    } finally {
      await client.close();
    }
  };

/** fonction de recherche si le pseudo fourni existe déjà dans la base Atlas
 * @async
 * @function chercherJoueur
 * @param {string} nom - pseudo saisi par le client
 * @returns {boolean}
 */ 
const chercherJoueur = async function (nom) {
    try {
        await client.connect();
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
        return false
    } finally {
        await client.close();
    }
};

/** fonction supprimant les pseudos ayant un score de 0
 * @async
 * @function purgerBDDdesZero
 */
const purgerBDDdesZero = async function() {
    try {
        await client.connect();
        await joueurs.deleteMany({score : 0});
        console.log("ménage fait dans le leaderboard");
    } catch (error){
        console.log('purger les 0 :', error);
    } finally {
        await client.close();
    }
}

/** fonction enregistrant les scores dans la base de données
 * @async
 * @function enregistrerScore
 * @param {string} pseudo - pseudo du joueur
 * @param {number} score - score du joueur
 */
const enregistrerScore = async function (pseudo, score) {
    try {
        await client.connect();
        joueurs.updateOne({pseudo: pseudo}, {$set: {score: score}}, {upsert : true});
    } catch (error){
        console.log('enregistrer score :', error);
    } finally {
        await client.close();
    }
};

module.exports.chercherLeaderboard = chercherLeaderboard;
module.exports.chercherJoueur = chercherJoueur;
module.exports.purgerBDDdesZero = purgerBDDdesZero;
module.exports.enregistrerScore = enregistrerScore;