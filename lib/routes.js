const util = require('./services/util.service');
const service = require('./services/routes.service');

module.exports = (app, modelDefinitions, options) => {
    require('./routes/generation.js')(app, modelDefinitions, options);
    service.createRoutes(app, modelDefinitions, options);
};
