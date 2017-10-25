// load the things we need
const mongoose = require('mongoose');

// define the schema for our user model
const userSchema = mongoose.Schema({
    name: String,
    facebookId: String,
    photo: String,
    authorised: Boolean,
    registrationDate: Date,
    lastAccessDate: Date,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);