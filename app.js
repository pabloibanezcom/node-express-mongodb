const express = require('express');
const cors = require('cors')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

require('dotenv').load();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.APP_NAME,
  resave: true,
  saveUninitialized: true
}));

const options = {
  app_name: process.env.APP_NAME,
  host: process.env.HOST,
  port: process.env.PORT,
  mongodb_uri: process.env.MONGODB_URI,
  root_path: '../../',
  models_path: './app/models',
  data_path: './app/data'
};

require('./app/passport/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

require('./index')(app, options, passport);

module.exports = app;
