const mongoose = require('mongoose');

const service = {};
const models = [];

service.generateModels = (modelDefinitions) => {
    modelDefinitions.forEach(md => {
        storeModel(md);
    });
    return models;
}

service.getModels = () => {
    return models;
}

service.getModel = (modelName) => {
    return models.find(m => m.modelName === modelName);
}

const storeModel = (modelDefinition) => {
    const objSchema = {};
    for(const prop in modelDefinition.properties) {
        objSchema[prop] = modelDefinition.properties[prop].type;
    }

    const schema = mongoose.Schema(objSchema);

    models.push(mongoose.model(modelDefinition.name, schema));
}

module.exports = service;