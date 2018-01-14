const util = require('../../services/util.service');
const modelsService = require('../../services/models.service');
const generationService = require('../../services/generation.service');
const modelDefinitionsService = require('../../services/modelDefinitions.service');

let refModelsToUpdate;

const createNew = async (dataObj, model, modelDefinitions) => {
    refModelsToUpdate = [];
    const mDefinition = modelDefinitions.find(md => md.name === model.modelName);
    const newObj = new model();
    for (const prop in mDefinition.properties) {
        newObj[prop] = await getPropertyValue(prop, mDefinition, dataObj);
    }
    const doc = await newObj.save();
    await modelsService.updateRelationships(doc, mDefinition.relationships);
    return doc;
}

const getPropertyValue = async (prop, modelDefinition, dataObj) => {
    // Check if property value needs to be generated
    let value = checkIfGenerateProperty(modelDefinition.properties[prop]);
    if (value) { return value };
    // Check if type is custom model
    value = await getCustomPropertyValue(prop, modelDefinition.properties[prop], dataObj);
    if (value) { return value };
    return dataObj[prop];
}

const getCustomPropertyValue = async (propertyName, property, dataObj) => {
    if (property.type !== null && !util.checkIfType(property.type)) {
        const typeName = Array.isArray(property.type) ? property.type[0] : property.type;
        if (dataObj[propertyName]) {
            const refObj = await modelsService.getModel(typeName).findOne(dataObj[propertyName]);
            refModelsToUpdate.push(typeName);
            return refObj.id;
        }
    }
}

const checkIfGenerateProperty = (property) => {
    if (property.generate === 'GUID') {
        return generationService.guid();
    }
    if (property.generate === 'DateNow') {
        return Date.now();
    }
    return null;
}

const updateRefModelWithNewObj = async (refModel, modelDefinition, newObjModel, newObj) => {
    let updateMode;
    let propertyName;
    for (const prop in modelDefinition.properties) {
        if (!Array.isArray(modelDefinition.properties[prop].type) && modelDefinitionsService.getPropertyType(modelDefinition.properties[prop]) === newObjModel) {
            updateMode = 'object';
            propertyName = prop;
        } else if (Array.isArray(modelDefinition.properties[prop].type) && modelDefinitionsService.getPropertyType(modelDefinition.properties[prop]) === newObjModel) {
            updateMode = 'array';
            propertyName = prop;
        }
    }
    if (updateMode) {
        const refModelObj = await modelsService.getModel(refModel).findOne({id: newObj[refModel]});
        if (updateMode === 'object') {
            refModelObj[propertyName] = newObj.id;
        } else {
            if (!refModelObj[propertyName]) {
                refModelObj[propertyName] = [];
            }
            refModelObj[propertyName].push(newObj.id);
        }
        delete refModelObj._doc['__v'];
        await refModelObj.save();
    }
}


module.exports = createNew;