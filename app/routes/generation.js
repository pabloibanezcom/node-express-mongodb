const http = require("http");
const generationService = require('../../generation/generation.service');

module.exports = (app, passport) => {
    app.get('/api/admin/generate',
        // passport.authenticate('facebook-token'),
        (req, res) => {
            generationService.all()
                .then(res.send())
                .catch(error => console.log(error));
        });
};
