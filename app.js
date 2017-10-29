const express = require('express');
const cors = require('cors')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

require('dotenv').load();
const mongoose = require('./app/mongoose.js');
const util = require('./app/services/util.service');
const app = express();
const modelDefinitions = util.getModelDefinitions();
const modelsService = require('./app/services/models.service');
modelsService.generateModels(modelDefinitions);
require('./app/passport/passport')(passport); 

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'node-express-mongodb.api',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 

require('./app/routes.js')(app, passport, modelDefinitions);

module.exports = app;
