const util = require('./services/util.service');
const service = require('./services/routes.service');

module.exports = (app, passport, modelDefinitions) => {
    require('./routes/generation.js')(app, passport, modelDefinitions);
    require('./routes/user.js')(app, passport);
    service.createRoutes(app, passport, modelDefinitions);
};
