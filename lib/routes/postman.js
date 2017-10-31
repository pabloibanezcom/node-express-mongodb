const postmanService = require('../services/postman.service');
const routesService = require('../services/routes.service');

module.exports = (app, config) => {

    app.get('/api/postman',
        (req, res) => {
            res.send(config);
        });

};