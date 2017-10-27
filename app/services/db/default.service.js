let Model;

const service = {};

service.setModel = (model) => {
    Model = model;
}

service.getAll = () => {
    return Model.find({});
}

service.get = (id) => {
    return Model.findById(id);
}

service.add = (obj, modelDefinition) => {
    const objSchema = {};
    for (const prop in obj) {
        if (!(modelDefinition.properties[prop]
            && modelDefinition.properties[prop].methodsNotAllowed
            && modelDefinition.properties[prop].methodsNotAllowed.add)) {
            objSchema[prop] = obj[prop];
        }
    }
    const newObj = new Model(objSchema);
    return newObj.save();
}

service.update = (id, obj, modelDefinition) => {
    const updObj = {};
    for (const prop in obj) {
        if (!(modelDefinition.properties[prop]
            && modelDefinition.properties[prop].methodsNotAllowed
            && modelDefinition.properties[prop].methodsNotAllowed.update)) {
            updObj[prop] = obj[prop];
        }
    }
    return Model.findByIdAndUpdate(id, updObj);
}

service.remove = (id) => {
    return Model.findByIdAndRemove(id);
}

module.exports = service;