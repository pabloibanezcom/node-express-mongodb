const dbService = require('../services/db/default.service');

module.exports = (app, passport, modelDefinition, model) => {

    const methods = {};

    methods.getAll = () => {
        app.get('/api/' + modelDefinition.route,
        // passport.authenticate('admin'),
        (req, res) => {
            dbService.getAll()
                .then(collection => res.send(collection))
                .catch(error => console.log(error));
        });
    }

    methods.get = () => {
        app.get('/api/' + modelDefinition.route + '/:id',
        // passport.authenticate('admin'),
        (req, res) => {
            dbService.get(req.param('id'))
                .then(obj => res.send(obj))
                .catch(error => console.log(error));
        });
    }

    methods.add = () => {
        app.post('/api/' + modelDefinition.route,
        // passport.authenticate('admin'),
        (req, res) => {
            dbService.add(req.body, modelDefinition)
                .then(obj => res.send(obj))
                .catch(error => console.log(error));
        });
    }

    methods.update = () => {
        app.put('/api/' + modelDefinition.route + '/:id',
        // passport.authenticate('admin'),
        (req, res) => {
            dbService.update(req.param('id'), req.body, modelDefinition)
                .then(obj => res.send(obj))
                .catch(error => console.log(error));
        });
    }

    methods.remove = () => {
        app.delete('/api/' + modelDefinition.route + '/:id',
        // passport.authenticate('admin'),
        (req, res) => {
            dbService.remove(req.param('id'))
                .then(obj => res.send(obj))
                .catch(error => console.log(error));
        });
    }

    dbService.setModel(model);
    for(const method in modelDefinition.methods) {
        if (modelDefinition.methods[method]) {
            methods[method]();
        }
    } 
    
};