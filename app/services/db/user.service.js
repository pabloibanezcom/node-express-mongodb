// load up the user model
const modelsService = require('../models.service');
const User = modelsService.getModel('User');

const userService = {};

userService.getUser = (req) => {
    return User.find({ 'facebookId': req.session.passport.user.facebookId });
}

module.exports = userService;