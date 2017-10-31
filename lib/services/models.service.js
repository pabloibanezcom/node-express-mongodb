const mongoose = require('mongoose');
const util = require('./util.service');

const service = {};
const models = [];

service.generateModels = (modelDefinitions, options) => {
    modelDefinitions.forEach(md => {
        storeModel(md, options);
    });
    return models;
}

service.getModels = () => {
    return models;
}

service.getModel = (modelName) => {
    return models.find(m => m.modelName === modelName);
}

const storeModel = (modelDefinition, options) => {

    if (mongoose.models[modelDefinition.name]) {
        return;
    }

    const objSchema = {};
    for(const prop in modelDefinition.properties) {
        if (util.checkIfBasicType(modelDefinition.properties[prop].type)) {
            objSchema[prop] = modelDefinition.properties[prop].type;
        } else {
            // Type is another model
            objSchema[prop] = { type: mongoose.Schema.Types.ObjectId, ref: modelDefinition.properties[prop].type};
        }
        
    }

    const schema = mongoose.Schema(objSchema);

    //Check if existing class is available
    const modelClass = util.getClassModel(options.models_path, modelDefinition.route);
    if (modelClass) {
        schema.loadClass(modelClass);
    }

    models.push(mongoose.model(modelDefinition.name, schema));
}

module.exports = service;