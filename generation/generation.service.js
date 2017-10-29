const utilService = require('../app/services/util.service');
const modelsService = require('../app/services/models.service');

const generationService = {};

let models;

generationService.all = (modelDefinitions) => {
    models = modelsService.getModels();
    const promiseSerial = funcs =>
        funcs.reduce((promise, func) =>
            promise.then(result => func().then(Array.prototype.concat.bind(result))),
            Promise.resolve([]))
    const funcs = models.map(model => () => populate(model, modelDefinitions.find(md => md.name === model.modelName)))
    return promiseSerial(funcs);
}

generationService.guid = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + '-' + s4();
}

const populate = (model, modelDefinition) => {
    return new Promise((resolve, reject) => {
        const dataPath = utilService.checkFile('./generation/', './data/' + modelDefinition.route + '.json', null);
        if (!dataPath) { resolve(); }
        const data = require(dataPath);
        const createFunction = require(utilService.checkFile('./generation/', './creation/' + modelDefinition.route + '.js', './creation/default'));
        model.remove({})
            .then(res => {
                let counter = 0;
                data.forEach(element => {
                    createFunction(element, model)
                        .then(res => {
                            counter++;
                            if (data.length === counter) {
                                resolve();
                            }
                        })
                });
            })
            .catch(err => {
                console.log(err);
                reject();
            });
    });
}

module.exports = generationService;