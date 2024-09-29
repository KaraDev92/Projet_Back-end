const express = require('express');
const router = express.Router();

/* GET jouer listing. */
// eslint-disable-next-line no-unused-vars
router.get('/', function(req, res, next) {
  res.render('jouer');
});

module.exports = router;


