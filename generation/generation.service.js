const models = require('./data/models');

const generationService = { models: {} };

generationService.all = () => {
    models.forEach(modelStr => { generationService.models[modelStr] = require('../app/models/' + modelStr.toLowerCase()); });
    const promiseSerial = funcs =>
        funcs.reduce((promise, func) =>
            promise.then(result => func().then(Array.prototype.concat.bind(result))),
            Promise.resolve([]))

    const funcs = models.map(model => () => generateModel(model))
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

const generateModel = (modelName) => {
    let creationPath = './creation/' + modelName.toLowerCase();
    try { fs.accessSync(creationPath); } 
    catch (e) { creationPath = './creation/default'; }
    return generateCollection(
        require('./data/' + modelName.toLowerCase()),
        generationService.models[modelName],
        require(creationPath),
        modelName
    );
}

const generateCollection = (collection, model, create, modelName) => {
    if (!create) {
        create = require('./creation/default');
    }
    return new Promise((resolve, reject) => {
        model.remove({})
            .then(res => {
                let counter = 0;
                collection.forEach(element => {
                    create(element, generationService.models, modelName)
                        .then(res => {
                            counter++;
                            if (collection.length === counter) {
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