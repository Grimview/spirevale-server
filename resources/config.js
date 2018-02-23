// Import required libraries
var args = require('minimist')(process.argv.slice(2));
var extend = require('extend');

// Store the environment variable
var environment = args.env || "production";

// Common configuration (i.e. name, version, max players, etc.)
var test_conf = {
    name: "MMO Game Server",
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

var prod_conf = {
    name: "MMO Game Server",
    version: "0.1.0",
    environment: environment,
    max_player: 100,
    data_paths: {
        items: __dirname + "/data/" + "items/",
        items: __dirname + "/data/" + "maps/",
        items: __dirname + "/data/" + "npcs/"
    },
    starting_zone: "rm_map_home"
}

// Environment-specific configuration
var conf = {
    production: {
        ip: args.ip || "0.0.0.0",
        port: args.port || "8081",
        database: "mongodb://sabbonaut:sene4Ase@ds127536.mlab.com:27536/mmogame"
        //database: "mongodb://sabearstian:sene4Ase@ds123976.mlab.com:23976/mmogame"
    },
    
    test: {
        ip: args.ip || "0.0.0.0",
        port: args.port || "8082",
        database: "mongodb://localhost:27017/mmogame"
        //database: "mongodb://sabearstian:sene4Ase@ds123976.mlab.com:23976/mmogame"
    }
};

extend(false, conf.production, test_conf);
extend(false, conf.test, test_conf);

module.exports = config = conf[environment];