const http = require("http");
const service = require('../services/modelexample.service');

module.exports = (app, passport) => {

     app.get('/api/modelexample',
    // passport.authenticate('admin'),
    (req, res) => {
        service.getAll()
            .then(collection => res.send(collection))
            .catch(error => console.log(error));
    });

    app.get('/api/modelexample/:id',
    // passport.authenticate('admin'),
    (req, res) => {
        service.get(req.param('id'))
            .then(obj => res.send(obj))
            .catch(error => console.log(error));
    });

    app.post('/api/modelexample',
    // passport.authenticate('admin'),
    (req, res) => {
        service.add(req.body)
            .then(obj => res.send(obj))
            .catch(error => console.log(error));
    });

    app.put('/api/modelexample/:id',
    // passport.authenticate('admin'),
    (req, res) => {
        service.update(req.param('id'), req.body)
            .then(obj => res.send(obj))
            .catch(error => console.log(error));
    });

    app.delete('/api/modelexample/:id',
    // passport.authenticate('admin'),
    (req, res) => {
        service.delete(req.param('id'))
            .then(obj => res.send(obj))
            .catch(error => console.log(error));
    });
};