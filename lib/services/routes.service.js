const util = require('./util.service');
const modelsService = require('./models.service');
const postmanService = require('./postman.service');

const service = { };

service.createRoutes = (app, modelDefinitions, options) => {
    modelDefinitions.forEach(md => {
        createRoutes(app, md);
    });
    service.printRoutes(app);
    require('../routes/postman')(app, postmanService.generate(service.routes, modelDefinitions, options));
}

service.storeRoute = (app, route) => {
    if(!app.routesInfo) {
        app.routesInfo = {};
    }
    if(!app.routesInfo[route.model]) {
        app.routesInfo[route.model] = [];
    }
    app.routesInfo[route.model].push(route);
}

service.printRoutes = (app) => {
    for (const group in app.routesInfo) {
        console.log('----- ' + group + ' -----');
        console.log('');
        app.routesInfo[group].forEach(route => {
            console.log(route.method + ': ' + route.url);
        });
        console.log('');
    }
}

const createRoutes = (app, modelDefinition) => {
    require('../routes/default')(app, modelDefinition, modelsService.getModel(modelDefinition.name));
    const modelRoute = util.checkFile('', './app/routes/' + modelDefinition.route + '.js', null);
    if (modelRoute) {
        require(util.getRootPath() + modelRoute)(app, modelsService.getModel(modelDefinition.name));
    }
}

module.exports = service;