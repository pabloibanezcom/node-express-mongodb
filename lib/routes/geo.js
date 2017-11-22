const util = require('../services/util.service');
const geoService = require('../services/geo.service');
const modelsService = require('../services/models.service');
const routesService = require('../services/routes.service');

module.exports = (app, modelDefinition, model, passport) => {

    let modelService;
    const urlBase = '/api/' + modelDefinition.route + '/geo/';
    const methods = {};

    const createRoutes = () => {
        if (!modelDefinition.geo) { return; }
        for (const prop in modelDefinition.geo) {
            createRoutesForOperator({ name: prop, models: modelDefinition.geo[prop] }, modelDefinition);
        }
    }

    const createRoutesForOperator = (operator, modelDefinition) => {
        for (const prop in operator.models) {
            createRouteForOperatorAndModel(operator.name, { name: prop, properties: operator.models[prop] }, modelDefinition);
        }
    }

    const createRouteForOperatorAndModel = (operator, otherModel, modelDefinition) => {
        if (otherModel.name === 'Custom') {
            otherModel.properties.by.forEach(p => createRouteForOperatorAndGeoType(operator, p, modelDefinition));
        } else {
            otherModel.properties.by.forEach(p => createRouteForOperatorAndModelByProperty(operator, otherModel.name, p, modelDefinition));
        }
    }

    const createRouteForOperatorAndModelByProperty = (operator, otherModelName, property, modelDefinition) => {
        const plainProperty = property.replace('_', '');
        const url = urlBase + operator + '/' + otherModelName.toLowerCase() + '/' + plainProperty + '/:' + plainProperty;
        app.get(url, (req, res) => {
            const searchObj = {};
            searchObj[property] = modelDefinition.properties[property] && modelDefinition.properties[property].type.toLowerCase() === 'string' ?
                new RegExp(req.param(plainProperty), 'i') : req.param(plainProperty);

            modelsService.getModel(otherModelName).find(searchObj)
                .then(result => {
                    if (!result.length) {
                        return res.send([]);
                    }
                    const toExclude = otherModelName === model.modelName ? searchObj[property] : null;
                    geoService.runOperator(operator, model, result[0].geometry, modelDefinition.geo[operator][otherModelName], toExclude)
                        .then(obj => res.send(obj))
                        .catch(err => res.status(500).send(err));
                })
                .catch(err => res.status(500).send(err));
        });
        routesService.storeRoute(app, {
            group: modelDefinition.group, model: modelDefinition.name,
            name: util.firstUpper(operator) + (operator === 'intersects' ? 'With' : '') + otherModelName + 'By' + util.firstUpper(plainProperty),
            method: 'GET', url: url
        });
    }

    const createRouteForOperatorAndGeoType = (operator, geoType, modelDefinition) => {
        url = urlBase + operator + '/' + geoType.toLowerCase();
        const urlInfo = geoService.getUrlInfoByGeoType(geoType);
        urlInfo.params.forEach(p => { url = url + '/:' + p; });

        app[urlInfo.method.toLowerCase()](url, (req, res) => {
            const geometry = geoService.getGeometryFromParams(geoType, req.params, req.body);
            geoService.runOperator(operator, model, geometry, modelDefinition.geo[operator]['Custom'])
                .then(obj => res.send(obj))
                .catch(err => res.status(500).send(err));
        });

        routesService.storeRoute(app, {
            group: modelDefinition.group, model: modelDefinition.name,
            name: util.firstUpper(operator) + 'With' + geoType,
            method: urlInfo.method, url: url
        });
    }

    createRoutes();

};