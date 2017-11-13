const util = require('../util.service');

const service = {};

service.getAll = (model, modelDefinition, id, obj, user) => {
    const findStr = user.isAdmin ? {} : { owner: user.id };
    return model.find(findStr).populate(buildPopulateStr(modelDefinition, 'getAll')).select('-owner');
}

service.get = (model, modelDefinition, id, obj, user) => {
    return model.findById(id).populate(buildPopulateStr(modelDefinition, 'get')).select('-owner');
}

service.add = (model, modelDefinition, id, obj, user) => {
    const objSchema = {};
    for (const prop in obj) {
        if (!(modelDefinition.properties[prop]
            && modelDefinition.properties[prop].methodsNotAllowed
            && modelDefinition.properties[prop].methodsNotAllowed.add)) {
            objSchema[prop] = util.checkIfBasicType(modelDefinition.properties[prop].type) ? obj[prop] : createCustomModelProperty(obj[prop], modelDefinition.properties[prop].type);
        }
    }
    objSchema.owner = user.id;
    const newObj = new model(objSchema);
    return newObj.save();
}

service.update = (model, modelDefinition, id, obj) => {
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

service.remove = (model, modelDefinition, id) => {
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