// load the things we need
const mongoose = require('mongoose');

// define the schema for our user model
const groupSchema = mongoose.Schema({
    property1: String,
    property2: String,
    property3: Number
});

// create the model for users and expose it to our app
module.exports = mongoose.model('ModelExample', groupSchema);