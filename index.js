const util = require('./lib/services/util.service');
const modelsService = require('./lib/services/models.service');

module.exports = (app, options, passport) => {
    // Initialize mongoose and DB
    require('./lib/mongoose.js')(options.mongodb_uri);

    // Initialize passport
    if(passport) {
        const passportService = require('./lib/services/passport.service');
        passportService.storePassport(passport);
    }
    
    // Get model definitions
    const modelDefinitions = util.getModelDefinitions(options.models_path);

    // Generate routes
    modelsService.generateModels(modelDefinitions, options)
    const routes = require('./lib/routes')(app, modelDefinitions, options);
};