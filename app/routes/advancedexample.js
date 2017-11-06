const service = require('../services/advancedexample.service');

module.exports = (app, model) => {
    const url = '/api/advancedexample/custom/custom';
    app.get(url,
        (req, res) => {
            service.custom(model)
                .then(result => res.send(result))
                .catch(error => console.log(error));
        });
    app.routesInfo['AdvancedExample'].push({ model: 'AdvancedExample', name: 'Custom',  method: 'GET', url: url });
};