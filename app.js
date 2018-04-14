var database = require('./controllers/database'); //load database early

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index'); //no real need - landing page for api
var authRouter = require('./routes/auth'); //all methods using Auth Controller
var usersRouter = require('./routes/users'); //all methods using Users Controller
// var societyRouter = require('./routes/society'); //all methods using Society Controller

var app = express();
app.use(cors({credentials: true, origin: true}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
// app.user('/society', societyRouter);

module.exports = app;
