const util = require('../util.service');

const service = {};

service.getAll = (model, modelDefinition) => {
    return model.find({}).populate(buildPopulateStr(modelDefinition, 'getAll'));
}

service.get = (model, modelDefinition, id) => {
    return model.findById(id).populate(buildPopulateStr(modelDefinition, 'get'));
}

service.add = (model, obj, modelDefinition) => {
    const objSchema = {};
    for (const prop in obj) {
        if (!(modelDefinition.properties[prop]
            && modelDefinition.properties[prop].methodsNotAllowed
            && modelDefinition.properties[prop].methodsNotAllowed.add)) {
            objSchema[prop] = util.checkIfBasicType(modelDefinition.properties[prop].type) ? obj[prop] : createCustomModelProperty(obj[prop], modelDefinition.properties[prop].type);
        }
    }
    const newObj = new model(objSchema);
    return newObj.save();
}

service.update = (model, id, obj, modelDefinition) => {
    const updObj = {};
    for (const prop in obj) {
        if (!(modelDefinition.properties[prop]
            && modelDefinition.properties[prop].methodsNotAllowed
            && modelDefinition.properties[prop].methodsNotAllowed.update)) {
            updObj[prop] = obj[prop];
        }
    }
    return model.findByIdAndUpdate(id, updObj);
}

service.remove = (model, id) => {
    return model.findByIdAndRemove(id);
}

const buildPopulateStr = (modelDefinition, method) => {
    let populateStr = '';
    for(const prop in modelDefinition.properties) {
        if (modelDefinition.properties[prop].populate && modelDefinition.properties[prop].populate[method]) {
            populateStr += prop + ' ';
        }
    }
    return populateStr;
}

const createCustomModelProperty = (objProp, type) => {
    if (typeof objProp === 'string') {
        return objProp;
    }
    return null;
}

module.exports = service;