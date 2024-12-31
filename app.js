var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sequelize = require('./models').sequelize;

var app = express();

//Database setup
(async () => {
  try {
    await sequelize.sync();
    await sequelize.authenticate();
    console.log("Connected to the database");
  } catch {
    console.log("There was an error syncing and connecting to the database");
  }
})()

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Serve static files at /static
app.use('/static', express.static(path.join(__dirname, 'public')));

//Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/favicon.ico', (req, res) => {
  res.send("No favicon here!");
})

//Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//Error handler
app.use(function (err, req, res, next) {
  //Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;