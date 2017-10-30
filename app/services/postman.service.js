const modelsService = require('./models.service');
const utilService = require('./util.service');

const service = {};

const config = { info: {}, item: [] }

service.generate = (routes, modelDefinitions) => {
    config.info = {
        name: process.env.APP_NAME,
        description: '',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    }
    for (const prop in routes) {
        config.item.push(generateFolderForModel(prop, routes[prop], modelDefinitions));
    }
    return config;
}

const generateFolderForModel = (modelName, modelRoutes, modelDefinitions) => {
    return {
        name: modelName,
        description: '',
        item: modelRoutes.map(mr => { return generateItemForRoute(mr, modelDefinitions) })
    }
}

const generateItemForRoute = (modelRoute, modelDefinitions) => {
    return {
        name: modelRoute.model + ' - ' + modelRoute.name,
        request: {
            method: modelRoute.method,
            header: generateHeader(modelRoute),
            body: generateBody(modelRoute, modelDefinitions),
            url: {
                protocol: 'http',
                host: [process.env.HOST],
                port: process.env.PORT,
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

const generateBody = (modelroute, modelDefinitions) => {
    const body = { mode: 'raw', raw: '' };
    const rawObj = {};
    if (modelroute.method === 'POST' || modelroute.method === 'PUT') {
        const modelDefinition = modelDefinitions.find(md => md.name === modelroute.model);
        const model = modelsService.getModel(modelroute.model);
        for (const prop in model.schema.obj) {
            if (modelDefinition.properties[prop]
                && !(modelDefinition.properties[prop].methodsNotAllowed
                    && modelDefinition.properties[prop].methodsNotAllowed[modelroute.name.toLowerCase()])) {
                rawObj[prop] = utilService.getExampleDataForType(model.schema.obj[prop]);
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