const util = require('./util.service');
const modelsService = require('./models.service');

const generationService = {};

let modelDefinitions;

let models;

generationService.all = async (mdlDefinitions, options) => {
    modelDefinitions = mdlDefinitions;
    models = modelsService.getModels();
    // First it deletes all the models collections
    for (let model of models) {
        if (model.name === 'User' && !await removeCollection(model)) {
            return { status: 500, message: 'Some error happened...' };
        }
    }
    //Then it creates new collections
    for (let model of models) {
        if (!await populate(model, modelDefinitions.find(md => md.name === model.modelName), options)) {
            return { status: 500, message: 'Some error happened...' };
        }
    }
    return { status: 200, message: 'Generation completed' };
}

const removeCollection = async (model) => {
    await model.remove({});
    return true; 
}

const populate = async (model, modelDefinition, options) => {
    const dataPath = util.checkFile(options.data_path, '/' + modelDefinition.route + '.json', null);
    if (!dataPath) {
        return true;
    }
    const data = require(util.getRootPath() + options.data_path + '/' + modelDefinition.route);
    const createFunction = require(util.checkFile(util.getRootPath + options.data_path, './creation/' + modelDefinition.route + '.js', '../generation/creation/default'));
    await model.remove({});
    let counter = 0;
    for (let element of data) {
        const createdObj = await createFunction(element, model, modelDefinitions);
        if (createdObj) {
            counter++;
            if (data.length === counter) {
                return true;
            }
        }
    }
}

module.exports = generationService;