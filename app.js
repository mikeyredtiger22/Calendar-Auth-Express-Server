var database = require('./controllers/databaseController'); //load database early

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index'); //no real need - landing page for api
var authRouter = require('./routes/auth'); //user authentication
var userRouter = require('./routes/user'); //all methods accessible for a logged in user
var societyRouter = require('./routes/society'); //all methods accessible for a committee member of a society

var app = express();
app.use(cors({credentials: true, origin: true}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/society', societyRouter);

module.exports = app;
