const util = require('../services/util.service');
const dbService = require('../services/db/default.service');
const routesService = require('../services/routes.service');

module.exports = (app, modelDefinition, model, passport) => {

    let modelService;
    const urlBase = '/api/' + modelDefinition.route;
    const methods = {};

    const createRoutes = () => {
        modelService = getModelService(modelDefinition);

        for (const method in modelDefinition.methods) {
            createMethod(method, modelDefinition.methods[method]);
        }
    }

    const getModelService = (modelDefinition) => {
        const modelServicePath = util.checkFile('', './app/services/' + modelDefinition.route + '.service.js', null);
        if (modelServicePath) {
            return require(util.getRootPath() + modelServicePath);
        }
        return null;
    }

    const createMethod = (name, methodDefinition) => {
        if (!methodDefinition.enabled) { return ;}
        const upperName = name.charAt(0).toUpperCase() + name.slice(1);
        const url = urlBase + methodDefinition.url_append;
        const authCallBack = getAuthCallback(name, modelDefinition);
        app[methodDefinition.method.toLowerCase()](
            url,
            authCallBack,
            (req, res) => {
                getServiceFunction(name)(model, modelDefinition, req.param('id'), req.body, req.session.passport.user)
                    .then(obj => res.send(obj))
                    .catch(error => console.log(error));
            });
        routesService.storeRoute(app, {
            group: modelDefinition.group, model: modelDefinition.name,
            name: upperName, method: methodDefinition.method, url: url, defineToken: !authCallBack.noToken
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
            return Object.assign(notAuthFunc, { noToken: true });
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