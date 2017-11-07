const util = require('./services/util.service');
const service = require('./services/routes.service');

module.exports = (app, modelDefinitions, options) => {
    require('./routes/generation.js')(app, util.modelDefinitionsSingleLevel(modelDefinitions), options);
    service.createRoutes(app, modelDefinitions, options);
};
