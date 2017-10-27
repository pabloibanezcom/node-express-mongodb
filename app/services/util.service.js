const fs = require('fs');
const path = require('path');
const modelsFolder = './app/models';

const service = {};

service.checkFile = (basePath, filePath, replacementPath) => {
    try {
        fs.accessSync(basePath + filePath);
        return filePath;
    }
    catch (e) {
        return replacementPath;
    }
}

service.getModelDefinitions = () => {
    const models = [];
    fs.readdirSync(modelsFolder).forEach(file => {
        if(path.extname(file) === ".json") {
            models.push(JSON.parse(fs.readFileSync(modelsFolder + '/' + file, 'utf8')));
        }
    })
    return models;
}

module.exports = service;