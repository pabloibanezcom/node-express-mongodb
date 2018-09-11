const fs = require('fs');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
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
    schema.plugin(mongoosePaginate);
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
            if (type[0] === '[') {
                return [{ type: mongoose.Schema.Types.ObjectId, ref: type.slice(1, -1) }]
            }
            return { type: mongoose.Schema.Types.ObjectId, ref: type };
        }
    }
    return {};
}

service.updateRelationships = async (newDoc, doc, relationships) => {
    if (!relationships) { return; }
    for (let rel of relationships) {
        await updateRelationship(newDoc, doc, rel);
    }
}

const updateRelationship = async (newDoc, doc, rel) => {
    // if (doc[rel.propertyMatch]) {
    if (!Array.isArray(doc[rel.propertyMatch])) {
        await updateRelationshipSingle(newDoc, doc, rel);
    }
    // }
}

const updateRelationshipSingle = async (newDoc, doc, rel) => {
    const model = service.getModel(rel.modelName);
    const docToUpdate = await model.findOne({ _id: doc[rel.propertyMatch] });
    if ((newDoc && newDoc[rel.propertyMatch] !== doc[rel.propertyMatch])) {
        // Removing existing ref
        if (docToUpdate) {
            await removeRef(docToUpdate, rel.modelProperty, doc._id, rel.many);
        }
        // Adding new ref
        if (newDoc[rel.propertyMatch]) {
            const newDocToUpdate = await model.findOne({ _id: newDoc[rel.propertyMatch] });
            await addRef(newDocToUpdate, rel.modelProperty, doc._id, rel.many);
        }
        return;
    }
    if (docToUpdate && !doc.isRemoved && !checkIfContainsRef(docToUpdate[rel.modelProperty], doc.id)) {
        await addRef(docToUpdate, rel.modelProperty, doc._id, rel.many);
    }
    if (docToUpdate && doc.isRemoved) {
        await removeRef(docToUpdate, rel.modelProperty, doc._id, rel.many)
    }
}

const checkIfContainsRef = (property, refId) => {
    if (!property) { return false };
    return (Array.isArray(property) && property.includes(refId) || property === refId);
}

const addRef = async (docToUpdate, prop, refId, many) => {
    if (!many) {
        docToUpdate[prop] = refId;
    } else {
        if (!docToUpdate[prop]) {
            docToUpdate._doc[prop] = [];
        }
        const index = docToUpdate[prop].indexOf(refId);
        if (index === -1) {
            docToUpdate[prop].push(refId);
        }
    }
    if (docToUpdate.lastModified) {
        docToUpdate.lastModified = Date.now();
    }
    await docToUpdate.save();
}

const removeRef = async (docToUpdate, prop, refId, many) => {
    if (!many) {
        docToUpdate[prop] = null;
    } else {
        const index = docToUpdate[prop].indexOf(refId);
        if (index > -1) {
            docToUpdate[prop].splice(index, 1);
        }
    }
    if (docToUpdate.lastModified) {
        docToUpdate.lastModified = Date.now();
    }
    await docToUpdate.save();
}


module.exports = service;