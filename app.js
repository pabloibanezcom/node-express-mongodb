const express = require('express');
const cors = require('cors')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

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
app.use(flash());

const options = {
  app_name: process.env.APP_NAME,
  token_key: process.env.TOKEN_KEY,
  host: process.env.HOST,
  mongodb_uri: process.env.MONGODB_URI,
  root_path: '../../'
};

require('./index')(app, options);

module.exports = app;
