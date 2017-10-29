const utilService = require('./util.service');
const modelsService = require('./models.service');

const service = { routes: {} };

service.createRoutes = (app, passport, modelDefinitions) => {
    modelDefinitions.forEach(md => {
        createRoutes(app, passport, md);
    });
    service.printRoutes();
}

service.storeRoute = (route) => {
    if(!service.routes[route.model]) {
        service.routes[route.model] = [];
    }
    service.routes[route.model].push(route);
}

service.printRoutes = () => {
    for (const group in service.routes) {
        console.log('----- ' + group + ' -----');
        console.log('');
        service.routes[group].forEach(route => {
            console.log(route.method + ': ' + route.url);
        });
        console.log('');
    }
}

const createRoutes = (app, passport, modelDefinition) => {
    utilService.checkFile('./app/');
    require('../routes/default')(app, passport, modelDefinition, modelsService.getModel(modelDefinition.name));
}

module.exports = service;