var express = require('express');
var router = express.Router();

/* GET jouer listing. */
router.get('/', function(req, res, next) {
  res.render('jouer');
});

module.exports = router;


