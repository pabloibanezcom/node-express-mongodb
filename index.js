const passport = require('passport');
const util = require('./lib/services/util.service');
const modelsService = require('./lib/services/models.service');

module.exports = (app, options) => {
    // Initialize mongoose and DB
    require('./lib/mongoose.js')(options.mongodb_uri);

    if (options.root_path) {
        util.setRootPath(options.root_path);
    }

    options.models_path = options.models_path ? options.models_path : './app';
    options.data_path = options.data_path ? options.data_path : './app/data';

    // Get model definitions
    const modelDefinitions = util.modelDefinitionsSingleLevel(util.getModelDefinitions(options.models_path));

    // Generate routes
    const models = modelsService.generateModels(modelDefinitions, options);
    if (!models.find(m => m.modelName === 'User')) {
        modelDefinitions.unshift(modelsService.generateUserModel());
    }

    // Initialize passport
    const passport_path = options.passport_path ? options.passport_path : './lib/auth/passport';
    require(passport_path)(passport, modelsService.getModel('User'));
    app.use(passport.initialize());
    app.use(passport.session());

    // Generate routes
    const routes = require('./lib/routes')(app, modelDefinitions, options, passport);
};