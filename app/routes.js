module.exports = (app, passport) => {
    require('./routes/generation.js')(app, passport);
    require('./routes/user.js')(app, passport);
    require('./routes/modelexample.js')(app, passport);
};
