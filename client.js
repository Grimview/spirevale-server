var now = require('performance-now');
var _ = require('underscore');

module.exports = function() {
    var client = this;

    this.initiate = function() {
        // Send the connection handshake packet to the client.
        client.socket.write(packet.build(["HELLO", now().toString()]));
        
        // DEBUG: Log that a client has been initialised.
        // console.log('Client initialised.');
    };

    this.enterroom = function(selected_room) {
        maps[selected_room].clients.forEach(function(otherClient) {
            // Send a position packet to all clients in the selected room.
            otherClient.socket.write(packet.build(["POSITION", client.character.name, client.character.pos_x, client.character.pos_y, client.character.facing]));
        });
        
        // Add current client to the selected room's client list.
        maps[selected_room].clients.push(client);
    };
    
    this.broadcastroom = function(packetData) {
        maps[client.character.current_room].clients.forEach(function(otherClient) {
            if (otherClient.character.name != client.character.name) {
                otherClient.socket.write(packetData);
            }
        });
    };

    this.data = function(data) {
        packet.parse(client, data);
    };
    
    this.error = function(err) {
        console.log("Client error: " + err.toString());
    };
    
    this.end = function() {
        if (client.character != undefined) {
            for (var i = 0; i < maps[client.character.current_room].clients.length; i++) {
                if(maps[client.character.current_room].clients[i].character.name == client.character.name){
                    maps[client.character.current_room].clients.splice(i, 1);
                } else {
                    maps[client.character.current_room].clients[i].socket.write(packet.build(["LOGOUT", client.character.name]));
                }
            }

            client.character.save();

            // DEBUG: Log the client that is disconnecting.
            // console.log(client.character.name + " has disconnected.");
        }
    };
};