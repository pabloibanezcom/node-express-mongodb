const util = require('./util.service');

const service = {};

service.checkRelationships = (modelDefinitions) => {
    modelDefinitions.forEach(md => {
        for (const prop in md.properties) {
            if (!util.checkIfType(md.properties[prop].type)) {
                const many = md.properties[prop].type[0] === '[';
                const type = !many ? md.properties[prop].type : md.properties[prop].type.slice(1, -1);
                addRelationship(
                    modelDefinitions,
                    {
                        modelToUpdate: type,
                        modelRelated: md.name,
                        propertyRelated: prop,
                        many: many
                    });
            }
        }
    });
    return modelDefinitions;
}

service.getPropertyType = (property) => {
    return property.type[0] === '[' ? property.type.slice(1, -1) : property.type;
}

const addRelationship = (modelDefinitions, relationship) => {
    const mdToUpdate = modelDefinitions.find(md => md.name === relationship.modelToUpdate);
    if (!mdToUpdate.relationships) {
        mdToUpdate.relationships = [];
    }
    mdToUpdate.relationships.push({
        modelName: relationship.modelRelated,
        modelProperty: relationship.propertyRelated,
        propertyMatch: findPropertyMatch(mdToUpdate, relationship.modelRelated, relationship.propertyRelated),
        many: relationship.many
    });
}

const findPropertyMatch = (model, modelRelated, propertyRelated) => {
    for (const prop in model.properties) {
        if (service.getPropertyType(model.properties[prop]) === modelRelated && model.properties[prop].propertyMatch === propertyRelated) {
            return prop;
        }
    }
    return null;
}

module.exports = service;