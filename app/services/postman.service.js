const service = {};

const config = { info: {}, item: [] }

service.generate = (routes) => {
    config.info = {
        name: process.env.APP_NAME,
        description: '',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    }
    for (const prop in routes) {
        config.item.push(generateFolderForModel(prop, routes[prop]));
    }
    return config;
}

const generateFolderForModel = (modelName, modelRoutes) => {
    return {
        name: modelName,
        description: '',
        item: modelRoutes.map(mr => { return generateItemForRoute(modelName, mr) })
    }
}

const generateItemForRoute = (modelName, modelRoute) => {
    return {
        name: modelName + ' - ' + modelRoute.name,
        request: {
            method: modelRoute.method,
            header: [],
            body: {},
            url: {
                // raw: process.env.BASE_URL + modelRoute.url,
                protocol: 'http',
                host: [ process.env.HOST ],
                port: process.env.PORT,
                path: modelRoute.url.substr(1).split('/')
            },
            description: ''
        }
    }
}

module.exports = service;