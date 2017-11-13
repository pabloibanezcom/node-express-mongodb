const util = require('./util.service');
const modelsService = require('./models.service');
const postmanService = require('./postman.service');
const authLevels = require('../auth/authLevels');

const service = {};

service.createRoutes = (app, modelDefinitions, options, passport) => {
    createUserRoutes(app, passport);
    modelDefinitions.forEach(md => {
        createRoutes(app, md, passport);
    });
    service.printRoutes(app);
    require('../routes/postman')(app, postmanService.generate(app.routesInfo, modelDefinitions, options));
}

service.storeRoute = (app, route) => {
    if (!app.routesInfo) {
        app.routesInfo = {};
    }
    if (!app.routesInfo[route.model]) {
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

const createRoutes = (app, modelDefinition, passport) => {
    modelDefinition.authLevel = authLevels.find(al => al.name === modelDefinition.authLevel);
    defineModelMethods(modelDefinition);
    require('../routes/default')(app, modelDefinition, modelsService.getModel(modelDefinition.name), passport);
    const modelRoute = util.checkFile('', './app/routes/' + modelDefinition.route + '.js', null);
    if (modelRoute) {
        const model = modelsService.getModel(modelDefinition.name);
        require(util.getRootPath() + modelRoute)(app, model, passport);
    }
}

const createUserRoutes = (app, passport) => {
    if (!util.checkFile('', './app/routes/user.js', null)) {
        require('../routes/user')(app, passport);
    }
}

const defineModelMethods = (modelDefinition) => {
    if (!modelDefinition.authLevel) { return; }
    if (!modelDefinition.methods) {
        modelDefinition.methods = {};
    }
    for (const prop in modelDefinition.authLevel.methods) {
        modelDefinition.methods[prop] = modelDefinition.methods[prop] ?
            modelDefinition.methods[prop] : modelDefinition.authLevel.methods[prop];
    }
}

module.exports = service;