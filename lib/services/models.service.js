const fs = require('fs');
const mongoose = require('mongoose');
const util = require('./util.service');
const authService = require('./auth.service');
const geoJsonService = require('./geojson.service');

const service = {};
const models = [];

geoJsonService.geoJSONSchemas(mongoose);

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
    const modelDefinition = require('../auth/user.json');
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

    //Check if owner property is required
    const authLevel = authService.getAuthLevels().find(md => md.name === modelDefinition.authLevel);
    if (authLevel) {
        for (const prop in authLevel.methods) {
            if (authLevel.methods[prop].passportStrategy === 'user') {
                objSchema.owner = { type: mongoose.Schema.Types.ObjectId, ref: 'User' };
            }
        }
    }

    const schema = new mongoose.Schema(objSchema);
    if (objSchema.geometry) {
        schema.index({ geometry: "2dsphere" });
    }

    //Check if existing class is available
    const modelClass = util.getClassModel(options.models_path, modelDefinition.route);
    if (modelClass) {
        schema.loadClass(modelClass);
    }

    models.push(mongoose.model(modelDefinition.name, schema));
}

const getPropertiesFromObject = (propertiesObj, objSchema) => {
    for (const prop in propertiesObj) {
        if (Array.isArray(propertiesObj[prop])) {
            objSchema[prop] = [];
            objSchema[prop].push(getMongooseSchemaType(propertiesObj[prop][0].type));
        } else {
            objSchema[prop] = getMongooseSchemaType(propertiesObj[prop].type);
        }
        if (objSchema[prop] === {}) {
            getPropertiesFromObject(propertiesObj[prop], objSchema[prop]);
        }
    }
}

const getMongooseSchemaType = (type) => {
    if (type) {
        if (util.checkIfType(type)) {
            return type;
        } else {
            // Type is another model
            return { type: mongoose.Schema.Types.ObjectId, ref: type };
        }
    }
    return {};
}

module.exports = service;