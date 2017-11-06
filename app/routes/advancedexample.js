const service = require('../services/advancedexample.service');
const routesService = require('../../lib/services/routes.service');

module.exports = (app, model) => {
    const url = '/api/advancedexample/custom/custom';
    app.get(url,
        (req, res) => {
            service.custom(model)
                .then(result => res.send(result))
                .catch(error => console.log(error));
        });
    routesService.storeRoute({ model: 'AdvancedExample', name: 'Custom',  method: 'GET', url: url });
};