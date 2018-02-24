var args = require('minimist')(process.argv.slice(2));
var extend = require('extend');

var environment = args.env || "development";

// #region Common Configuration
var common_conf = {
    name: "Spirevale Server",
    version: "0.1.0",
    environment: environment,
    max_player: 100,
    data_paths: {
        items: __dirname + "\\data\\" + "items\\",
        maps: __dirname + "\\data\\" + "maps\\",
        npcs: __dirname + "\\data\\" + "npcs\\"
    },
    starting_zone: "rm_map_home"
};
// #endregion

// #region Environment-specific Configuration
var conf = {
    production: {
        ip: args.ip || "0.0.0.0",
        port: args.port || "8081",
        database: "mongodb://sabbonaut:sene4Ase@ds127536.mlab.com:27536/mmogame"
    },
    
    development: {
        ip: args.ip || "0.0.0.0",
        port: args.port || "8082",
        database: "mongodb://localhost:27017/mmogame"
    }
};
// #endregion

extend(false, conf.production, common_conf);
extend(false, conf.development, common_conf);

module.exports = config = conf[environment];