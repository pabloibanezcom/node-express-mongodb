const dbService = require('../services/db/default.service');
const routesService = require('../services/routes.service');

module.exports = (app, passport, modelDefinition, model) => {

    const urlBase = '/api/' + modelDefinition.route;

    const methods = {};

    methods.getAll = () => {
        const url = urlBase;
        app.get(url,
            // passport.authenticate('admin'),
            (req, res) => {
                dbService.getAll(model)
                    .then(collection => res.send(collection))
                    .catch(error => console.log(error));
            });
        routesService.storeRoute({ model: modelDefinition.name, name: 'GetAll', method: 'GET', url: url });
    }

    methods.get = () => {
        const url = urlBase + '/:id';
        app.get(url,
            // passport.authenticate('admin'),
            (req, res) => {
                dbService.get(model, req.param('id'))
                    .then(obj => res.send(obj))
                    .catch(error => console.log(error));
            });
        routesService.storeRoute({ model: modelDefinition.name, name: 'Get', method: 'GET', url: url });
    }

    methods.add = () => {
        const url = urlBase;
        app.post(url,
            // passport.authenticate('admin'),
            (req, res) => {
                dbService.add(model, req.body, modelDefinition)
                    .then(obj => res.send(obj))
                    .catch(error => console.log(error));
            });
        routesService.storeRoute({ model: modelDefinition.name, name: 'Add', method: 'POST', url: url });
    }

    methods.update = () => {
        const url = urlBase + '/:id';
        app.put(url,
            // passport.authenticate('admin'),
            (req, res) => {
                dbService.update(model, req.param('id'), req.body, modelDefinition)
                    .then(obj => res.send(obj))
                    .catch(error => console.log(error));
            });
        routesService.storeRoute({ model: modelDefinition.name, name: 'Update', method: 'PUT', url: url });
    }

    methods.remove = () => {
        const url = urlBase + '/:id';
        app.delete(url,
            // passport.authenticate('admin'),
            (req, res) => {
                dbService.remove(model, req.param('id'))
                    .then(obj => res.send(obj))
                    .catch(error => console.log(error));
            });
        routesService.storeRoute({ model: modelDefinition.name, name: 'Remove', method: 'DELETE', url: url });
    }

    for (const method in modelDefinition.methods) {
        if (modelDefinition.methods[method]) {
            methods[method]();
        }
    }

};