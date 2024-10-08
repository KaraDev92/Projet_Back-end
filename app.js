"use strict"

/** Module exporté app
 * @module app
 * @require module:routes/indexRouter
 * @require module:routes/jouerRouter
 */

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/jouer');

/** @constant {Express} app - instance d'une application Express*/
const app = express();

// view engine setup
// eslint-disable-next-line no-undef
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/accueil', indexRouter);
app.use('/jouer', usersRouter);
// eslint-disable-next-line no-undef
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/images/favicon.ico')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const message404 = "Oups, \n Spock a lancé une pierre sur le lézard qui lui a craché son venin pour se venger. Mais Spock en esquivant a trébuché sur les ciseaux. et c'est le papier qui a reçu le venin et subséquemment a pris feu ! \n Pfiou ..."
  next(createError(404, message404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
