const postmanService = require('../services/postman.service');
const routesService = require('../services/routes.service');

module.exports = (app) => {

    const postmanConfig = postmanService.generate();

    app.get('/api/postman',
        (req, res) => {
            res.send(postmanConfig);
        });

};