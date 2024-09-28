const express = require('express');
const router = express.Router();
require('dotenv').config();
const {phrasesJeu} = require('../variables.js');

const {chercherLeaderboard} = require('../WSetMDBA/mongodba.js');


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




