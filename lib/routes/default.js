const util = require('../services/util.service');
const dbService = require('../services/db/default.service');
const routesService = require('../services/routes.service');

module.exports = (app, modelDefinition, model, passport) => {

    let modelService;
    const urlBase = '/api/' + modelDefinition.route;
    const methods = {};

    const createRoutes = () => {
        modelService = getModelService(modelDefinition);
        methods.getAll = () => {
            const url = urlBase;
            app.get(url,
                getAuthCallback('getAll'),
                (req, res) => {
                    getServiceFunction('getAll')(model, modelDefinition)
                        .then(collection => res.send(collection))
                        .catch(error => console.log(error));
                });
            routesService.storeRoute(app, { group: modelDefinition.group, model: modelDefinition.name, name: 'GetAll', method: 'GET', url: url });
        }

        methods.get = () => {
            const url = urlBase + '/:id';
            app.get(url,
                getAuthCallback('get'),
                (req, res) => {
                    getServiceFunction('get')(model, modelDefinition, req.param('id'))
                        .then(obj => res.send(obj))
                        .catch(error => console.log(error));
                });
            routesService.storeRoute(app, { group: modelDefinition.group, model: modelDefinition.name, name: 'Get', method: 'GET', url: url });
        }

        methods.add = () => {
            const url = urlBase;
            app.post(url,
                getAuthCallback('add'),
                (req, res) => {
                    getServiceFunction('add')(model, req.body, modelDefinition)
                        .then(obj => res.send(obj))
                        .catch(error => console.log(error));
                });
            routesService.storeRoute(app, { group: modelDefinition.group, model: modelDefinition.name, name: 'Add', method: 'POST', url: url });
        }

        methods.update = () => {
            const url = urlBase + '/:id';
            app.put(url,
                getAuthCallback('update'),
                (req, res) => {
                    getServiceFunction('update')(model, req.param('id'), req.body, modelDefinition)
                        .then(obj => res.send(obj))
                        .catch(error => console.log(error));
                });
            routesService.storeRoute(app, { group: modelDefinition.group, model: modelDefinition.name, name: 'Update', method: 'PUT', url: url });
        }

        methods.remove = () => {
            const url = urlBase + '/:id';
            app.delete(url,
                getAuthCallback('remove'),
                (req, res) => {
                    getServiceFunction('remove')(model, req.param('id'))
                        .then(obj => res.send(obj))
                        .catch(error => console.log(error));
                });
            routesService.storeRoute(app, { group: modelDefinition.group, model: modelDefinition.name, name: 'Remove', method: 'DELETE', url: url });
        }

        for (const method in modelDefinition.methods) {
            if (modelDefinition.methods[method].enabled) {
                methods[method]();
            }
        }
    }

    const getModelService = (modelDefinition) => {
        const modelServicePath = util.checkFile('', './app/services/' + modelDefinition.route + '.service.js', null);
        if (modelServicePath) {
            return require(util.getRootPath() + modelServicePath);
        }
        return null;
    }

    const getServiceFunction = (method) => {
        return modelService && modelService[method] ? modelService[method] : dbService[method];
    }

    const notAuthFunc = (accessToken, refreshToken, profile, done) => {
        return true;
    }

    const getAuthCallback = (method) => {
        if (modelDefinition.methods[method].passportStrategy) {
            return passport.authenticate(modelDefinition.methods[method].passportStrategy);
        }
        return notAuthFunc;
    }

    createRoutes();

};