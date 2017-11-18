const util = require('./util.service');
const modelsService = require('./models.service');

const generationService = {};

let models;

generationService.all = (modelDefinitions, options) => {
    models = modelsService.getModels();
    const promiseSerial = funcs =>
        funcs.reduce((promise, func) =>
            promise.then(result => func().then(Array.prototype.concat.bind(result))),
            Promise.resolve([]))
    const funcs = models.map(model => () => populate(model, modelDefinitions.find(md => md.name === model.modelName), options))
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

const populate = (model, modelDefinition, options) => {
    return new Promise((resolve, reject) => {
        const dataPath = util.checkFile(options.data_path, '/' + modelDefinition.route + '.json', null);
        if (!dataPath) { 
            resolve();
            return;
         }
        const data = require(util.getRootPath() + options.data_path + '/' + modelDefinition.route);
        const createFunction = require(util.checkFile(util.getRootPath + options.data_path, './creation/' + modelDefinition.route + '.js', '../generation/creation/default'));
        model.remove({})
            .then(res => {
                let counter = 0;
                data.forEach(element => {
                    createFunction(element, model, modelDefinition)
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