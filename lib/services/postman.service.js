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

    // const object = {};
    // modelDefinitions[5].group.reduce((o, s) => { return o[s] = {}; }, object);

    for (const prop in routes) {
        config.item.push(generateFolderForModel(prop, routes[prop], util.getModelDefinition(modelDefinitions, 'name', prop), options));
    }
    return config;
}

const generateFolderForModel = (modelName, modelRoutes, modelDefinition, options) => {
    return {
        name: modelName,
        description: '',
        item: modelRoutes.map(mr => { return generateItemForRoute(mr, modelDefinition, options) })
    }
}

const generateItemForRoute = (modelRoute, modelDefinition, options) => {
    return {
        name: modelRoute.model + ' - ' + modelRoute.name,
        request: {
            method: modelRoute.method,
            header: generateHeader(modelRoute),
            body: generateBody(modelRoute, modelDefinition),
            url: {
                protocol: 'http',
                host: [options.host],
                port: options.port,
                path: modelRoute.url.substr(1).split('/'),
                variable: generateUrlVariable(modelRoute)
            },
            description: ''
        }
    }
}

const generateHeader = (modelroute) => {
    if (modelroute.method === 'POST' || modelroute.method === 'PUT') {
        return [{ key: 'Content-Type', value: 'application/json' }];
    }
    return [];
}

const generateBody = (modelroute, modelDefinition) => {
    const body = { mode: 'raw', raw: '' };
    const rawObj = {};
    if (modelroute.method === 'POST' || modelroute.method === 'PUT') {
        const model = modelsService.getModel(modelroute.model);
        for (const prop in model.schema.obj) {
            if (modelDefinition.properties[prop]
                && !(modelDefinition.properties[prop].methodsNotAllowed
                    && modelDefinition.properties[prop].methodsNotAllowed[modelroute.name.toLowerCase()])) {
                rawObj[prop] = util.getExampleDataForType(model.schema.obj[prop]);
            }
        }
        body.raw = JSON.stringify(rawObj, null, 2);
        return body;
    }
    return body;
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

module.exports = service;