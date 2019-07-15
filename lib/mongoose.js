const mongoose = require('mongoose');

module.exports = (mongodb_uri) => {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    mongoose.connect(mongodb_uri, { promiseLibrary: global.Promise, useNewUrlParser: true });

    log = (msg) => {
        process.env.NODE_ENV !== 'test' && console.log(msg);
    }

    mongoose.connection.on('connected', function () {
        log('Mongoose default connection open');
    });

    mongoose.connection.on('error', function (err) {
        log('Mongoose default connection error: ' + err);
    });

    mongoose.connection.on('disconnected', function () {
        log('Mongoose default connection disconnected');
    });
}