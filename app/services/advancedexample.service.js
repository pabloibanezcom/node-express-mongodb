const service = {};

// Override default service
// service.getAll = (model) => {
//     return model.find({});
// }

service.custom = (model) => {
    return model.findOne({});
}

module.exports = service;