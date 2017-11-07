const util = require('./lib/services/util.service');
const modelsService = require('./lib/services/models.service');

module.exports = (app, options, passport) => {
    // Initialize mongoose and DB
    require('./lib/mongoose.js')(options.mongodb_uri);

    if (options.root_path) {
        util.setRootPath(options.root_path);
    }

    options.models_path = options.models_path ? options.models_path : './app';
    options.data_path = options.data_path ? options.data_path : './app/data';

    // Initialize passport
    if(passport) {
        const passportService = require('./lib/services/passport.service');
        passportService.storePassport(passport);
    }
    
    // Get model definitions
    const modelDefinitions = util.getModelDefinitions(options.models_path);

    // Generate routes
    modelsService.generateModels(util.modelDefinitionsSingleLevel(modelDefinitions), options)
    const routes = require('./lib/routes')(app, modelDefinitions, options);
};