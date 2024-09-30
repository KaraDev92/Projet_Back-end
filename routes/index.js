
/** Module router 
 * @module indexRouter
 * @requires module:WSetMDBA/mongodba
 * @requires module:variables 
 * */

const express = require('express');
require('dotenv').config();
const {phrasesJeu} = require('../variables.js');
const {chercherLeaderboard} = require('../WSetMDBA/mongodba.js');

/** @constant {Router} router */
const router = express.Router();

/* GET home page. */
// eslint-disable-next-line no-unused-vars
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




