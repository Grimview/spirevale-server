var zeroBuffer = new Buffer('00', 'hex');

module.exports = packet = {
    // #region Build
    build: function(params) {
        var packetParts = [];
        var packetSize = 0;
        
        params.forEach(function(param, index) {
            var buffer;
            
            if (index == 0) {
                buffer = new Buffer(1);
                buffer.writeUInt8(param, 0);
            } else if (typeof param === 'string') {
                buffer = new Buffer(param, 'utf8');
                buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1);
            } else if (typeof param === 'number') {
                buffer = new Buffer(2);
                buffer.writeUInt16LE(param, 0);
            } else if (typeof param === 'boolean') {
                var convertedParam = param ? 1 : 0;

                buffer = new Buffer(1);
                buffer.writeUInt8(convertedParam, 0);
            } else {
                console.log("WARNING: Unknown data type in packet builder!");
            }
            
            packetSize += buffer.length;
            packetParts.push(buffer);
        });
        
        var dataBuffer = Buffer.concat(packetParts, packetSize);
        
        var size = new Buffer(1);
        size.writeUInt8(dataBuffer.length + 1, 0);
        
        var finalPacket = Buffer.concat([size, dataBuffer], size.length + dataBuffer.length);
        
        return finalPacket;
    },
    // #endregion

    // #region Parse
    parse: function(client, data) {
        var idx = 0;
        
        while (idx < data.length) {
            var packetSize = data.readUInt8(idx);
            var extractedPacket = new Buffer(packetSize);
            data.copy(extractedPacket, 0, idx, idx + packetSize);
            
            this.interpret(client, extractedPacket);
            
            idx += packetSize;
        }
    },
    // #endregion

    // #region Interpret
    interpret: function(client, datapacket) {
        var header = PacketModels.header.parse(datapacket);

        switch (header.command) {
            // #region Handshake
            case 0:
                // Handle the handshake packet.
            break;
            // #endregion

            // #region Register
            case 1:
                var data = PacketModels.register.parse(datapacket);

                Player.register(data.firstName, data.lastName, data.month, data.day, data.year, data.email, data.password, function(successful) {
                    if (successful) {
                        client.socket.write(packet.build([1, true]));
                    } else {
                        client.socket.write(packet.build([1, false]));
                    }
                });
            break;
            // #endregion

            // #region Login
            case 2:
                var data = PacketModels.login.parse(datapacket);

                Player.login(data.email, data.password, function(successful, player) {
                    if (successful) {
                        client.player = player;

                        client.socket.write(packet.build([2, true]));
                    } else {
                        client.socket.write(packet.build([2, false]));
                    }
                });
            break;
            // #endregion
            
            // #region Character List
            case 3:
                Character.findOne({player_id: client.player.id}, function(err, character) {
                    if (!err && character) {
                        client.socket.write(packet.build([3, true, character.name]));
                    } else {
                        client.socket.write(packet.build([3, false]));
                    }
                });
            break;
            // #endregion

            // #region New Character
            case 4:
                var data = PacketModels.newcharacter.parse(datapacket);

                Character.create(client.player.id, data.name, "spr_Hero", 4, maps[config.starting_zone].room, maps[config.starting_zone].start_x, maps[config.starting_zone].start_y, 100, 100, 100, 100, 100, 100, 1, 10, 0, 50, function(successful, character) {
                    if (successful) {
                        Character.findOne({player_id: client.player.id}, function(err, character) {
                            if (!err && character) {
                                client.socket.write(packet.build([3, true, character.name]));
                            } else {
                                client.socket.write(packet.build([3, false]));
                            }
                        });
                    }
                });
            break;
            // #endregion

            // #region Spawn
            case 5:
                var data = PacketModels.spawn.parse(datapacket);

                Character.findOne({player_id: client.player.id, name: data.name}, function(err, character) {
                    if (!err && character) {
                        client.character = character;
                        
                        client.enterroom(client.character.current_room);

                        client.character.save();

                        client.socket.write(packet.build([5, client.character.name, client.character.current_room, client.character.pos_x, client.character.pos_y, client.character.health, client.character.maxHealth, client.character.thirst, client.character.maxThirst, client.character.hunger, client.character.maxHunger, client.character.woodcutting, client.character.maxWoodcutting, client.character.woodcuttingExp, client.character.maxWoodcuttingExp]));
                    }
                });
            break;
            // #endregion

            // #region Position
            case 6:
                var data = PacketModels.position.parse(datapacket);
                client.character.pos_x = data.target_x;
                client.character.pos_y = data.target_y;
                client.character.facing = data.facing;

                //client.player.save();

                client.broadcastroom(packet.build([6, client.character.name, data.target_x, data.target_y, data.facing]));
            break;
            // #endregion

            // #region Chat
            case 7:
                var data = PacketModels.chat.parse(datapacket);
                
                console.log(client.character.name + " said: " + data.message);
            break;
            // #endregion
        }
    }
    // #endregion
};