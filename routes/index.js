const express = require('express');
const router = express.Router();
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();
const {phrasesJeu} = require('../variables.js');

const uri = process.env.MONGODB_CONNECTION_STRING;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function chercherLeaderboard() {
  try {
    const database = client.db('projet_back-end');
    const joueurs = database.collection('chifoumi');
    const options = { projection: { _id: 0, pseudo: 1, score:1} };
    const cursor = joueurs.find({}, options).sort({score:-1});
    const leaderboard = await cursor.toArray();
    console.log("result1 :", leaderboard);
    return leaderboard;
  } catch (error){
    console.dir(error);
    return [{pseudo: '---', score: '---'}];
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};


/* GET home page. */
router.get('/', async function(req, res, next) {
  const leaderboard = await chercherLeaderboard();
  console.log("leaderboard", leaderboard);
  if (leaderboard) {
    res.render('index', { listeGagnants : leaderboard, regles : phrasesJeu });
  } else {
    res.render('index', {regles : phrasesJeu});
  }
});

module.exports = router;




