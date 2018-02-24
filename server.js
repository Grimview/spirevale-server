// #region Libraries
var fs = require('fs');
var net = require('net');

require(__dirname + '/resources/config.js');
require('./packet.js');

// #region Initialisers
var init_files = fs.readdirSync(__dirname + "/initialisers");
init_files.forEach(function(initFile) {
    // console.log("Packing initialiser file, " + initFile + ".");

    require(__dirname + "/initialisers/" + initFile);
});
// #endregion

// #region Maps
maps = {};
var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function(mapFile) {
    // console.log("Packing map file, " + mapFile + ".");

    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map;
});
// #endregion

// #region NPCs
npcs = {};
var npc_files = fs.readdirSync(config.data_paths.npcs);
npc_files.forEach(function(npcFile) {
    // console.log("Packing map file, " + npcFile + ".");

    var npc = require(config.data_paths.npcs + npcFile);
    npcs[npc.id] = npc;
});
// #endregion

// #region Models
var model_files = fs.readdirSync(__dirname + "/models");
model_files.forEach(function(modelFile) {
    // console.log("Packing model file, " + modelFile + ".");

    require(__dirname + "/models/" + modelFile);
});
// #endregion
// #endregion

net.createServer(function(socket) {
    var clientInstance = new require('./client.js');
    var thisClient = new clientInstance();
    
    thisClient.socket = socket;
    thisClient.initiate();
    
    socket.on('error', thisClient.error);
    
    socket.on('end', thisClient.end);
    
    socket.on('data', thisClient.data);
}).listen(config.port);

// Log that the server is running on a specified port.
console.log("The server is running on port " + config.port + " in the " + config.environment + " environment.");