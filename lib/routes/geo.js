const util = require('../services/util.service');
const geoService = require('../services/geo.service');
const modelsService = require('../services/models.service');
const routesService = require('../services/routes.service');

module.exports = (app, modelDefinition, model, passport) => {

    let modelService;
    const urlBase = '/api/' + modelDefinition.route + '/geo/';
    const methods = {};
    const geoPostOptions = {
        operator: '',
        with: {
            model: '',
            by: '',
            value: ''
        },
        maxDistance: null,
        minDistance: null,
        select: '',
        populate: '',
        sort: ''
    };

    const createRoutes = () => {
        if (!modelDefinition.properties.geometry) { return; }
        createGeoRoute(model, modelDefinition);
    }

    const createGeoRoute = (model, modelDefinition) => {
        const url = urlBase;
        app.post(url, (req, res) => {
            geoService.query(model, modelDefinition, req.body)
            .then(obj => {
                res.send(obj)
            })
            .catch(err => {
                res.status(500).send(err.message)
            });
        });
        routesService.storeRoute(app, {
            group: modelDefinition.group, model: modelDefinition.name,
            name: 'Geo',
            method: 'POST', 
            url: url,
            body: geoPostOptions
        });
    }

    createRoutes();
};