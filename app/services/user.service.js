// load up the user model
const User = require('../models/user');

const userService = {};

userService.getUser = (req) => {
    return User.find({ 'facebookId': req.session.passport.user.facebookId });
}

module.exports = userService;