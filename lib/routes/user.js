const userService = require('../services/db/user.service');
const routesService = require('../services/routes.service');

module.exports = (app, passport) => {
    const url = '/api/user';
    app.get(url,
        passport.authenticate('facebook-token'),
        (req, res) => {
            userService.getUser(req)
                .then(users => processResponse(res, users[0]))
                .catch(error => console.log(error));
        });
    routesService.storeRoute({ model: 'User', name: 'GetAll',  method: 'GET', url: url });

    const processResponse = (res, result) => {
        if (result) {
            res.send(result);
        } else {
            res.status(404).send('Not found');
        }
    }
};