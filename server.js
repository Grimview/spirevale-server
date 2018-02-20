// Import required libraries
require(__dirname + '/resources/config.js');
var fs = require('fs');
var net = require('net');
require('./packet.js');

// Load the initialisers
var init_files = fs.readdirSync(__dirname + "/initialisers");
init_files.forEach(function(initFile) {
    console.log("Packing initialiser file, " + initFile + ".");
    require(__dirname + "/initialisers/" + initFile);
});

// Load the maps
maps = {};
var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function(mapFile) {
    console.log("Packing map file, " + mapFile + ".");
    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map;
});

// Load the models
var model_files = fs.readdirSync(__dirname + "/models");
model_files.forEach(function(modelFile) {
    console.log("Packing model file, " + modelFile + ".");
    require(__dirname + "/models/" + modelFile);
});

// Initialise the server and listen to the internet
net.createServer(function(socket) {
    // Server logic
    var c_inst = new require('./client.js');
    var thisClient = new c_inst();
    
    thisClient.socket = socket;
    thisClient.initiate();
    
    socket.on('error', thisClient.error);
    
    socket.on('end', thisClient.end);
    
    socket.on('data', thisClient.data);
    
    // DEBUG: Log that a client has connected.
    // console.log("Client connected.");
}).listen(config.port);

// DEBUG: Log that the server has been initialised.
// console.log("Initialisation completed. Server is running on port: " + config.port + " for environment: " + config.environment);
console.log("The server is listening for clients.");