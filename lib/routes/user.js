const routesService = require('../services/routes.service');
const login_config = require('../auth/config/login');
const signup_config = require('../auth/config/signup');

module.exports = (app, passport) => {
    app.get(login_config.url,
        passport.authenticate('local-login', { session: false }),
        (req, res, aux) => {
            res.status(req.user.statusCode).send(req.user.result);
        }
    );
    routesService.storeRoute(app, {
        group: 'User', model: 'User', name: 'Login', method: 'GET', url: login_config.url,
        custom_postman_request: login_config.custom_request, test_script: login_config.test_script
    });

    app.post(signup_config.url, passport.authenticate('local-signup', {}),
        (req, res, aux) => {
            res.status(200).send();
        }
    );
    routesService.storeRoute(app, {
        group: 'User', model: 'User', name: 'SignUp', method: 'POST', url: signup_config.url,
        custom_postman_request: signup_config.custom_request
    });
};


