require('mongoose-geojson-schema');
const mongoose = require('mongoose');

module.exports = (mongodb_uri) => {
    mongoose.connect(mongodb_uri, { useMongoClient: true, promiseLibrary: global.Promise });
    
    mongoose.connection.on('connected', function () {
        console.log('Mongoose default connection open');
    });
    
    mongoose.connection.on('error', function (err) {
        console.log('Mongoose default connection error: ' + err);
    });
    
    mongoose.connection.on('disconnected', function () {
        console.log('Mongoose default connection disconnected');
    });
}