var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

module.exports = gamedb = mongoose.connect(config.database, { useMongoClient: true });