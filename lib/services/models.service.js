const fs = require('fs');
const mongoose = require('mongoose');
const util = require('./util.service');

const service = {};
const models = [];

service.getModels = () => {
    return models;
}

service.getModel = (modelName) => {
    return models.find(m => m.modelName === modelName);
}

service.generateModels = (modelDefinitions, options) => {
    modelDefinitions.forEach(md => {
        storeModel(md, options);
    });
    return models;
}

service.generateUserModel = () => {
    const modelDefinition = JSON.parse(fs.readFileSync('./lib/auth/user.json', 'utf8'));
    const objSchema = {};
    getPropertiesFromObject(modelDefinition.properties, objSchema);
    const schema = mongoose.Schema(objSchema);
    schema.loadClass(require('../auth/user'));
    models.push(mongoose.model(modelDefinition.name, schema));
    return modelDefinition;
}

const storeModel = (modelDefinition, options) => {

    if (mongoose.models[modelDefinition.name]) {
        models.push(mongoose.models[modelDefinition.name]);
        return;
    }

    const objSchema = {};
    getPropertiesFromObject(modelDefinition.properties, objSchema);

    //Check if is private
    if (!modelDefinition.public) {
        objSchema.owner = { type: mongoose.Schema.Types.ObjectId, ref: 'User' };
    }

    const schema = mongoose.Schema(objSchema);

    //Check if existing class is available
    const modelClass = util.getClassModel(options.models_path, modelDefinition.route);
    if (modelClass) {
        schema.loadClass(modelClass);
    }

    models.push(mongoose.model(modelDefinition.name, schema));
}

const getPropertiesFromObject = (propertiesObj, objSchema) => {
    for (const prop in propertiesObj) {
        if (propertiesObj[prop].type) {
            if (util.checkIfBasicType(propertiesObj[prop].type)) {
                objSchema[prop] = propertiesObj[prop].type;
            } else {
                // Type is another model
                objSchema[prop] = { type: mongoose.Schema.Types.ObjectId, ref: propertiesObj[prop].type };
            }
        } else {
            objSchema[prop] = {};
            getPropertiesFromObject(propertiesObj[prop], objSchema[prop]);
        }
    }
}

module.exports = service;