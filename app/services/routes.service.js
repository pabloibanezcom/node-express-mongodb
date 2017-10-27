const modelsService = require('./models.service');
const service = {};

service.createRoutes = (app, passport, modelDefinitions) => {
    modelsService.generateModels(modelDefinitions);
    modelDefinitions.forEach(md => {
        createRoutes(app, passport, md);
    });
}

const createRoutes = (app, passport, modelDefinition) => {
    require('../routes/default')(app, passport, modelDefinition, modelsService.getModel(modelDefinition.name));
}

module.exports = service;