const utilService = require('./util.service');
const modelsService = require('./models.service');
const postmanService = require('./postman.service');

const service = { routes: {} };

service.createRoutes = (app, modelDefinitions, options) => {
    modelDefinitions.forEach(md => {
        createRoutes(app, md);
    });
    service.printRoutes();
    require('../routes/postman')(app, postmanService.generate(service.routes, modelDefinitions, options));
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

const createRoutes = (app, modelDefinition) => {
    require('../routes/default')(app, modelDefinition, modelsService.getModel(modelDefinition.name));
    const modelRoute = utilService.checkFile('', './app/routes/' + modelDefinition.route + '.js', null);
    if (modelRoute) {
        require('../../' + modelRoute)(app, modelsService.getModel(modelDefinition.name));
    }
}

module.exports = service;