var now = require('performance-now');
var _ = require('underscore');

module.exports = function() {
    var client = this;

    // #region Initialise Connection
    this.initiate = function() {
        // Send the connection handshake packet to the client.
        client.socket.write(packet.build([0, now().toString()]));
        
        // DEBUG: Log that a client has been initialised.
        // console.log('Client initialised.');
    };
    // #endregion

    // #region Enter Room
    this.enterroom = function(selected_room) {
        maps[selected_room].clients.forEach(function(otherClient) {
            // Send a position packet to all clients in the selected room.
            otherClient.socket.write(packet.build([6, client.character.name, client.character.pos_x, client.character.pos_y, client.character.facing]));
        });
        
        // Add current client to the selected room's client list.
        maps[selected_room].clients.push(client);
    };
    // #endregion
    
    // #region Broadcast to Room
    this.broadcastroom = function(packetData) {
        maps[client.character.current_room].clients.forEach(function(otherClient) {
            if (otherClient.character.name != client.character.name) {
                otherClient.socket.write(packetData);
            }
        });
    };
    // #endregion

    // #region Parse Data
    this.data = function(data) {
        packet.parse(client, data);
    };
    // #endregion
    
    // #region Handle Errors
    this.error = function(err) {
        console.log("Client error: " + err.toString());
    };
    // #endregion
    
    // #region Disconnect
    this.end = function() {
        if (client.character != undefined) {
            for (var i = 0; i < maps[client.character.current_room].clients.length; i++) {
                if(maps[client.character.current_room].clients[i].character.name == client.character.name){
                    maps[client.character.current_room].clients.splice(i, 1);
                } else {
                    maps[client.character.current_room].clients[i].socket.write(packet.build(["logout", client.character.name]));
                }
            }

            client.character.save();

            // DEBUG: Log the client that is disconnecting.
            // console.log(client.character.name + " has disconnected.");
        }
    };
    // #endregion
};