const userService = require('../services/user.service');

module.exports = (app, passport) => {
    app.get('/api/user',
        passport.authenticate('facebook-token'),
        (req, res) => {
            userService.getUser(req)
                .then(users => processResponse(res, users[0]))
                .catch(error => console.log(error));
        });

    const processResponse = (res, result) => {
        if (result) {
            res.send(result);
        } else {
            res.status(404).send('Not found');
        }
    }
};