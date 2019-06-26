const passport = require('passport');
const util = require('./lib/services/util.service');
const modelsService = require('./lib/services/models.service');
const utilService = require('./lib/services/util.service');
const modelDefinitionsService = require('./lib/services/modelDefinitions.service');
const authService = require('./lib/services/auth.service');
const geoService = require('./lib/services/geo.service');

const init = (app, options) => {
    // Initialize mongoose and DB
    require('./lib/mongoose.js')(options.mongodb_uri);

    if (options.root_path) {
        util.setRootPath(options.root_path);
    }

    options.models_path = options.models_path ? options.models_path : './app';
    options.data_path = options.data_path ? options.data_path : './app/data';

    // Initialize authService with authLevels
    authService.init(options.authLevels);

    // Get model definitions
    let modelDefinitions = util.modelDefinitionsSingleLevel(util.getModelDefinitions(options.models_path)).filter(md => md.name !== 'User');

    // Generate models
    modelsService.generateModels(modelDefinitions, options);
    modelDefinitions.unshift(modelsService.generateUserModel());

    // Generate relationships
    modelDefinitions = modelDefinitionsService.checkRelationships(modelDefinitions);

    // Initialize passport
    const passport_path = options.passport_path ? options.passport_path : './lib/auth/passport';
    const token_key = options.token_key ? options.token_key : 'NO_KEY_51';
    require(passport_path)(passport, modelsService.getModel('User'), token_key);
    app.use(passport.initialize());
    app.use(passport.session());

    // Generate routes
    const routes = require('./lib/routes')(app, modelDefinitions, options, passport);
}

module.exports = {
    init: init,
    getModel: modelsService.getModel,
    geo: geoService,
    util: utilService
};