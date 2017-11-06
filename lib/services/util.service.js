const fs = require('fs');
const path = require('path');

let rootPath = '../../../../';
const service = {};

service.setRootPath = (rpath) => {
    rootPath = rpath;
}

service.getRootPath = () => {
    return rootPath;
}

service.checkFile = (basePath, filePath, replacementPath) => {
    try {
        fs.accessSync(basePath + filePath);
        return filePath;
    }
    catch (e) {
        return replacementPath;
    }
}

service.getModelDefinitions = (modelsFolder) => {
    const models = [];
    fs.readdirSync(modelsFolder).forEach(file => {
        if (path.extname(file) === ".json" && file !== 'models.json') {
            models.push(JSON.parse(fs.readFileSync(modelsFolder + '/' + file, 'utf8')));
        }
    })
    return orderModels(modelsFolder, models);
}

service.getClassModel = (modelsFolder, modelName) => {
    const modelClassPath = service.checkFile(modelsFolder, '/' + modelName + '.js', null);
    return modelClassPath ? require(service.getRootPath() + modelsFolder + modelClassPath) : null;
}

service.getExampleDataForType = (type) => {
    if (type.ref || type.toLowerCase() === 'string') {
        return '';
    }
    if (type.toLowerCase() === 'number') {
        return 0;
    }
    return null;
}

service.checkIfBasicType = (type) => {
    if (type.toLowerCase() === 'string' || type.toLowerCase() === 'number' || type.toLowerCase() === 'date'
        || type.toLowerCase() === 'buffer' || type.toLowerCase() === 'boolean' || type.toLowerCase() === 'mixed'
        || type.toLowerCase() === 'objectid' || type.toLowerCase() === 'array') {
        return true;
    }
    return false;
}

const orderModels = (modelsFolder, models) => {
    const modelsOrderPath = service.checkFile(modelsFolder, '/models.json', null);
    if (modelsOrderPath) {
        const modelsOrder = JSON.parse(fs.readFileSync(modelsFolder + modelsOrderPath));
        const orderedModels = [];
        modelsOrder.forEach(mn => {
            const model = models.find(m => m.name === mn);
            model.added = true;
            orderedModels.push(model);
        });
        models.filter(m => !m.added).forEach(model => {
            orderedModels.push(model);
        });
        return orderedModels;
    }
    return models;
}

module.exports = service;