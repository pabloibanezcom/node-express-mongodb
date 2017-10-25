const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true, promiseLibrary: global.Promise });

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open');
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

module.exports = mongoose;