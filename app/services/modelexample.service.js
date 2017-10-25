const ModelExample = require('../models/modelexample');

const service = {};

service.getAll = () => {
    return ModelExample.find({});
}

service.get = (id) => {
    return ModelExample.findById(id);
}

service.add = (obj) => {
    const newObj = new ModelExample({
        property1: obj.property1,
        property2: obj.property2,
        property3: obj.property3
    });
    return newObj.save();
}

service.update = (id, obj) => {
    return ModelExample.findByIdAndUpdate(id, obj);
}

service.delete = (id) => {
    return ModelExample.findByIdAndRemove(id);
}

module.exports = service;