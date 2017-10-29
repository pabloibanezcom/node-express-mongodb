const service = {};

service.getAll = (model) => {
    return model.find({});
}

service.get = (model, id) => {
    return model.findById(id);
}

service.add = (model, obj, modelDefinition) => {
    const objSchema = {};
    for (const prop in obj) {
        if (!(modelDefinition.properties[prop]
            && modelDefinition.properties[prop].methodsNotAllowed
            && modelDefinition.properties[prop].methodsNotAllowed.add)) {
            objSchema[prop] = obj[prop];
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

module.exports = service;