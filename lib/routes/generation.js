const generationService = require('../services/generation.service');

module.exports = (app, modelDefinitions, options) => {

    app.get('/api/admin/generate', async (req, res) => {
        const result = await generationService.all(modelDefinitions, options);
        res.status(result.status).send(result.message);
    })

};
