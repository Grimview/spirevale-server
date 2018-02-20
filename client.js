// Implements a function that returns an hr-time stamp.
var now = require('performance-now');
// Functional Programming Helpers library.
var _ = require('underscore');

module.exports = function() {
    var client = this;
    
    // These objects will be added at runtime
    
    // Initialisation
    this.initiate = function() {
        // Send the connection handshake packet to the client.
        client.socket.write(packet.build(["HELLO", now().toString()]));
        
        // DEBUG: Log that a client has been initialised.
        // console.log('Client initialised.');
    };
    
    // Client methods
    this.enterroom = function(selected_room) {
        maps[selected_room].clients.forEach(function(otherClient) {
            otherClient.socket.write(packet.build(["ENTER", client.bitmason.username, client.bitmason.pos_x, client.bitmason.pos_y]));
        });
        
        maps[selected_room].clients.push(client);
    };
    
    this.broadcastroom = function(packetData) {
        maps[client.bitmason.current_room].clients.forEach(function(otherClient) {
            if (otherClient.bitmason.username != client.bitmason.username) {
                otherClient.socket.write(packetData);
            };
        });
    };
    
    // Socket Stuff
    this.data = function(data) {
        packet.parse(client, data);
    };
    
    this.error = function(err) {
        console.log("Client error: " + err.toString());
    };
    
    this.end = function() {
        var i = 0;

        // DEBUG: Log the client that is disconnecting.
        // console.log(client.bitmason.username + " has disconnected.");
        
        maps[client.bitmason.current_room].clients.forEach(function(otherClient){
            //console.log("Looping through clients: " + i.toString() + " = " +  maps[client.bitmason.current_room].clients[i].bitmason.username);
            
            if(otherClient.bitmason.username == client.bitmason.username){
                //console.log("Removing index " + i.toString() + " from clients");
                maps[client.bitmason.current_room].clients.splice(i, 1);
                //console.log("maps[].clients: " + maps[client.bitmason.current_room].clients);
            };
            
            i += 1;
        });
        client.bitmason.logged_in = false;
        client.bitmason.save();
    };
};