const util = require('../../services/util.service');
const modelsService = require('../../services/models.service');

const createNew = (dataObj, model, modelDefinition) => {
    const promises = [];
    return new Promise((resolve, reject) => {
        const newObj = new model();
        Object.entries(dataObj).forEach(entry => {
            promises.push(getPropertyValue(newObj, entry, modelDefinition));
        });
        Promise.all(promises)
            .then(() => {
                newObj.save(err => {
                    if (err) { reject() };
                    resolve();
                })
            }
            )
            .catch(err => {
                console.log(err);
                reject();
            });
    });
}

const getPropertyValue = (newObj, property, modelDefinition) => {
    return new Promise((resolve, reject) => {
        if (Array.isArray(property[1])) {
            resolve();
        }
        if (property[1] !== null && !util.checkIfType(property[1].type)) {
            const model = modelsService.getModel(modelDefinition.properties[property[0]].type);
            model.findOne(property[1])
                .then(result => {
                    newObj[property[0]] = result.id;
                    resolve();
                })
                .catch(err => {
                    console.log(err);
                    reject();
                })
        } else {
            newObj[property[0]] = property[1];
            resolve();
        }
    });
}

const propertyValuePromise = (obj, property) => {
    return new Promise((resolve, reject) => {
        if (property[1] !== null && !util.checkIfType(property[1].type)) {
            const model = modelsService.getModel(modelDefinition.properties[property[0]].type);
            model.findOne(property[1])
                .then(result => {
                    obj[property[0]] = result.id;
                    resolve();
                })
                .catch(err => {
                    console.log(err);
                    reject();
                })
        } else {
            obj[property[0]] = property[1];
            resolve();
        }
    });
}

module.exports = createNew;