const http = require("http");
const generationService = require('../../generation/generation.service');

module.exports = (app, passport, modelDefinitions) => {
    app.get('/api/admin/generate',
        // passport.authenticate('facebook-token'),
        (req, res) => {
            generationService.all(modelDefinitions)
                .then(res.send())
                .catch(error => console.log(error));
        });
};
