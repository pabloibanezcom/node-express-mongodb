const generationService = require('../services/generation.service');

module.exports = (app, modelDefinitions, options) => {
    app.get('/api/admin/generate',
        // passport.authenticate('facebook-token'),
        (req, res) => {
            generationService.all(modelDefinitions, options)
                .then(res.send())
                .catch(error => console.log(error));
        });
};
