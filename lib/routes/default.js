const util = require('../services/util.service');
const dbService = require('../services/db/default.service');
const routesService = require('../services/routes.service');
const methodDefinitions = require('../routes/methodDefinitions');

module.exports = (app, modelDefinition, model, passport) => {

    let modelService;
    const urlBase = '/api/' + modelDefinition.route;
    const methods = {};

    const createRoutes = () => {
        modelService = getModelService(modelDefinition);
        // methodDefinitions.forEach(md => {
        //     createMethod(md);
        // });

        for (const method in modelDefinition.methods) {
            if (modelDefinition.methods[method].enabled) {
                const methodDefinition = methodDefinitions.find(md => md.name === method);
                if (methodDefinition) {
                    createMethod(methodDefinition);
                }
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

    const createMethod = (methodDefinition) => {
        const upperName = methodDefinition.name.charAt(0).toUpperCase() + methodDefinition.name.slice(1);
        const url = urlBase + methodDefinition.url_append;
        app[methodDefinition.method.toLowerCase()](
            url,
            getAuthCallback(methodDefinition.name, modelDefinition),
            (req, res) => {
                getServiceFunction(methodDefinition.name)(model, modelDefinition, req.param('id'), req.body)
                    .then(obj => res.send(obj))
                    .catch(error => console.log(error));
            });
        routesService.storeRoute(app, {
            group: modelDefinition.group, model: modelDefinition.name,
            name: upperName, method: methodDefinition.method, url: url
        });
    }

    const getServiceFunction = (method) => {
        return modelService && modelService[method] ? modelService[method] : dbService[method];
    }

    const notAuthFunc = (accessToken, refreshToken, profile, done) => {
        return true;
    }

    const getAuthCallback = (method, modelDefinition) => {
        if (modelDefinition.methods[method].passportStrategy) {
            return setStrategy(modelDefinition.methods[method].passportStrategy);
        }
        if (modelDefinition.authLevel && modelDefinition.authLevel.methods[method].passportStrategy) {
            return setStrategy(modelDefinition.authLevel.methods[method].passportStrategy);
        }
        return setStrategy('public');;
    }

    const setStrategy = (passportStrategy) => {
        if (passportStrategy === 'public') {
            return notAuthFunc;
        }
        if (passportStrategy === 'admin') {
            return passport.authenticate('local-admin');
        }
        if (passportStrategy === 'user') {
            return passport.authenticate('local-user');
        }
        return passport.authenticate('local-user');
    }

    createRoutes();

};