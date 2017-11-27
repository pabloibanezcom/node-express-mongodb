const util = require('../../services/util.service');
const modelsService = require('../../services/models.service');

const createNew = (dataObj, model, modelDefinition) => {
    const promises = [];
    return new Promise((resolve, reject) => {
        if (model.modelName === 'Station') {
            const aux = 2;
        }
        const newObj = new model();
        for(const prop in dataObj) {
            promises.push(getPropertyValue(newObj, dataObj[prop], modelDefinition));
        }
        // Object.entries(dataObj).forEach(entry => {
        //     promises.push(getPropertyValue(newObj, entry, modelDefinition));
        // });
        Promise.all(promises)
            .then(() => {
                if (model.modelName === 'Station') {
                    const Line = modelsService.getModel('Line');
                    Line.find({})
                        .then(lines => {
                            newObj.lines = [];
                            newObj.lines.push(lines[0].id);
                            newObj.save(err => {
                                if (err) { reject() };
                                resolve();
                            })
                        })
                        .catch();
                } else {
                    newObj.save(err => {
                        if (err) { reject() };
                        resolve();
                    })
                }
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
            // Check if type is custom model
            const type = modelDefinition.properties[property[0]] ? modelDefinition.properties[property[0]][0].type : null;
            if (type !== null && !util.checkIfType(type)) {
                const model = modelsService.getModel(type);
                // Look for ids of each of objects
                const promises = [];
                property[1].forEach(pe => {
                    promises.push(getDocumentId(model, 'name', pe, newObj[property[0]]));
                });
                Promise.all(promises)
                    .then(() => {
                        resolve();
                    }
                    )
                    .catch(err => {
                        console.log(err);
                        reject();
                    });
            }
            property[1].forEach(p => {
                if (p !== null && !util.checkIfType(p.type)) {
                    const model = modelsService.getModel(modelDefinition.properties[property[0]][0].type);
                }
            });
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

const getDocumentId = (model, property, value, storeArray) => {
    return new Promise((resolve, reject) => {
        const findStr = {};
        findStr[property] = value;
        model.findOne(findStr)
            .then(res => {
                storeArray.push(res);
                resolve();
            })
            .catch(err => {
                console.log(err);
                reject();
            });
    });

}


module.exports = createNew;