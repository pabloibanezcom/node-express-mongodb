const modelsService = require('./models.service');
const util = require('./util.service');

const service = {};

const config = { info: {}, item: [] }

service.generate = (routes, modelDefinitions, options) => {
    config.info = {
        name: options.app_name,
        description: '',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    }

    for (const prop in routes) {
        config.item.push(generateFolderForModel(prop, routes[prop], util.getModelDefinition(modelDefinitions, 'name', prop), options));
    }
    return config;
}

const generateFolderForModel = (modelName, modelRoutes, modelDefinition, options) => {
    const result = {
        name: modelName,
        description: '',
        item: Object.assign(modelRoutes.filter(mr => mr.name !== 'Login').map(mr => {
            return generateItemForRoute(mr, modelDefinition, options)
        }), {})
    }
    if (modelName === 'User') {
        result.item = generateLoginRouteItems(modelRoutes.find(mr => mr.name === 'Login'), modelDefinition, options).concat(result.item);
    }
    return result;
}

const generateItemForRoute = (modelRoute, modelDefinition, options) => {
    return {
        name: modelRoute.model + ' - ' + modelRoute.name + getPassportStrategy(util.firstLower(modelRoute.name), modelDefinition),
        event: generateTestScript(modelRoute),
        request: {
            method: modelRoute.method,
            header: modelRoute.custom_postman_request && modelRoute.custom_postman_request.header ?
                modelRoute.custom_postman_request.header : generateHeader(modelRoute),
            body: modelRoute.custom_postman_request && modelRoute.custom_postman_request.body ?
                modelRoute.custom_postman_request.body : generateBody(modelRoute, modelDefinition),
            url: {
                protocol: options.protocol,
                host: [options.host],
                port: options.port,
                path: modelRoute.url.substr(1).split('/'),
                variable: modelRoute.custom_postman_request && modelRoute.custom_postman_request.url && modelRoute.custom_postman_request.url.variable ?
                    modelRoute.custom_postman_request.url.variable : generateUrlVariable(modelRoute),
                query: modelRoute.custom_postman_request && modelRoute.custom_postman_request.url && modelRoute.custom_postman_request.url.query ?
                    modelRoute.custom_postman_request.url.query : []
            },
            description: ''
        }
    }
}

const generateLoginRouteItems = (modelRoute, modelDefinition, options) => {
    if (!modelRoute) { return {}; }
    const loginItems = [];

    if (!options.exampleUsers || !options.exampleUsers === {}) {
        loginItems.push(generateItemForRoute(modelRoute, modelDefinition, options));
    }

    for (const prop in options.exampleUsers) {
        const customModelRoute = {
            name: 'Login as ' + prop,
            custom_postman_request: {
                url: {
                    query: [
                        { key: 'email', value: options.exampleUsers[prop].email },
                        { key: 'password', value: options.exampleUsers[prop].password }
                    ]
                }
            }
        }
        loginItems.push(generateItemForRoute(Object.assign(modelRoute, customModelRoute), modelDefinition, options));
    }
    return loginItems;
}

const generateTestScript = (modelroute) => {
    if (modelroute.test_script) {
        return [{ listen: 'test', script: { type: 'text/javascript', exec: [modelroute.test_script] } }];
    }
    return;
}

const generateHeader = (modelroute) => {
    const header = [];
    if (modelroute.method === 'POST' || modelroute.method === 'PUT') {
        header.push({ key: 'Content-Type', value: 'application/json' });
    }
    if (modelroute.defineToken) {
        header.push({ key: 'Authorization', value: 'Bearer {{token}}' });
    }

    return header;
}

const generateBody = (modelroute, modelDefinition) => {
    const body = { mode: 'raw', raw: '' };
    let rawObj = {};
    if (modelroute.body) {
        rawObj = modelroute.body;
    } else {
        let propertiesParent = rawObj;
        if (modelroute.name === 'Search') {
            rawObj.filter = {};
            rawObj.sort = {};
            rawObj.limit = 0;
            rawObj.select = {};
            propertiesParent = rawObj.filter;
        }
        if (modelroute.method === 'POST' || modelroute.method === 'PUT') {
            const model = modelsService.getModel(modelroute.model);
            for (const prop in model.schema.obj) {
                if (modelDefinition.properties[prop]
                    && !(modelDefinition.properties[prop].methodsNotAllowed
                        && modelDefinition.properties[prop].methodsNotAllowed[modelroute.name.toLowerCase()])) {
                    addPropertyToBody(propertiesParent, prop, model.schema.obj[prop], modelroute.name === 'Search');
                }
            }
        }
    }
    body.raw = JSON.stringify(rawObj, null, 2);
    return body;
}

const addPropertyToBody = (rawObj, propertyName, type, isSearch) => {
    if (isSearch && typeof type === 'string') {
        if (type.toLowerCase() === 'string' || type.toLowerCase() === 'boolean') {
            rawObj[propertyName] = util.getExampleDataForType(type); 
        }
        if (type.toLowerCase() === 'number' || type.toLowerCase() === 'date') {
            rawObj[propertyName + 'Min'] = null;
            rawObj[propertyName + 'Max'] = null; 
        }
        return;
    }
    rawObj[propertyName] = util.getExampleDataForType(type); 
}

const generateUrlVariable = (modelRoute) => {
    const result = [];
    modelRoute.url.substr(1).split('/').forEach(pathElement => {
        if (pathElement[0] === ':') {
            result.push({ key: pathElement.substr(1), value: '' })
        }
    });
    return result;
}

const getPassportStrategy = (routeName, modelDefinition) => {
    if (!modelDefinition.authLevel.methods[routeName] || modelDefinition.authLevel.methods[routeName].passportStrategy === 'public') {
        return ''
    }
    return ' (' + modelDefinition.authLevel.methods[routeName].passportStrategy[0].toUpperCase() + ')';
}

module.exports = service;