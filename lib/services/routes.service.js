const chalk = require('chalk');
const log = console.log;
const util = require('./util.service');
const modelsService = require('./models.service');
const postmanService = require('./postman.service');
const authService = require('./auth.service');

const service = {};

service.createRoutes = (app, modelDefinitions, options, passport) => {
    createUserRoutes(app, passport);
    modelDefinitions.forEach(md => {
        createRoutes(app, md, passport);
    });
    process.env.NODE_ENV !== 'test' && service.printRoutes(app);
    require('../routes/postman')(app, postmanService.generate(app.routesInfo, modelDefinitions, options));
    service.printPostmanUrl(options.root_url);
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
    Object.keys(app.routesInfo).sort().map(group => {
        log(chalk.cyan(`----- ${group} -----`));
        log('');
        app.routesInfo[group].forEach(route => {
            log(`${chalk[getColorFromMethod(route.method)](route.method)}: ${route.url}`);
        });
        log('');
    });
}

service.printPostmanUrl = (rootUrl) => {
    if (process.env.NODE_ENV !== 'test') {
        const postmanUrl = `${rootUrl || '{{ROOT_URL}}'}${process.env.PORT ? `:${process.env.PORT}` : ''}/api/postman`;
        log(chalk.cyan(`You can import project in Postman from ${postmanUrl}`));
        log('');
    }
}

const createRoutes = (app, modelDefinition, passport) => {
    const model = modelsService.getModel(modelDefinition.name);
    modelDefinition.authLevel = authService.getAuthLevels().find(al => al.name === modelDefinition.authLevel);
    defineModelMethods(modelDefinition);
    require('../routes/default')(app, modelDefinition, model, passport);
    require('../routes/geo')(app, modelDefinition, model, passport);
    const modelRoute = util.checkFile('', './app/routes/' + modelDefinition.route + '.js', null);
    if (modelRoute) {
        require(util.getRootPath() + modelRoute)(app, modelsService, passport, modelDefinition);
    }
}

const createUserRoutes = (app, passport) => {
    require('../routes/user')(app, passport);
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

const getColorFromMethod = (method) => {
    switch (method) {
        case 'GET':
            return 'green';
        case 'POST':
            return 'yellow';
        case 'PUT':
            return 'blue';
        case 'DELETE':
            return 'red';
        default:
            return 'white';
    }
}

module.exports = service;