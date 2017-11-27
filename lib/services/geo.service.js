const modelsService = require('./models.service');

const service = {};

const operators = {
    intersects: "$geoIntersects",
    within: "$geoWithin",
    near: "$near",
    nearSphere: "$nearSphere"
}

service.query = (model, modelDefinition, options) => {
    return new Promise((resolve, reject) => {
        // If otherModel is different from the base one
        const searchObj = {};
        searchObj[options.with.by] = options.with.value;
        const operator = operators[options.operator];
        if (!operator) {
            reject(new Error('Operator not allowed'));
        }
        modelsService.getModel(options.with.model).find(searchObj)
            .then(result => {
                if (!result.length) {
                    return res.send([]);
                }
                let findObj = {};
                findObj = applyGeometry(findObj, operator, result[0].geometry, options);
                findObj = excludeOwnDocument(findObj, model.modelName, options);
                model.find(findObj).populate(options.populate || "").select(options.select || "").sort(options.sort || "")
                    .then(res => {
                        resolve(res);
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

const applyGeometry = (findObj, operator, geometry, options) => {
    findObj.geometry = {};
    findObj.geometry[operator] = { $geometry: geometry };
    if (operator === operators['near']) {
        findObj.geometry[operator].$maxDistance = options.maxDistance || 0;
        findObj.geometry[operator].$minDistance = options.minDistance || 0;
    }
    return findObj;
}

const excludeOwnDocument = (findObj, modelName, options) => {
    if (modelName === options.with.model) {
        findObj[options.with.by] = { $ne: options.with.value };
    }
    return findObj;
}

module.exports = service;