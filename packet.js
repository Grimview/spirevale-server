var zeroBuffer = new Buffer('00', 'hex');

module.exports = packet = {
    // ------------------------------------ //
    // - BUILD PACKETS TO SEND TO CLIENTS - //
    // ------------------------------------ //
    build: function(params) {
        // params: an array of javascript objects to be turned into buffers

        var packetParts = [];
        var packetSize = 0;
        
        params.forEach(function(param) {
            var buffer;
            
            if (typeof param === 'string') {
                buffer = new Buffer(param, 'utf8');
                buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1);
            } else if (typeof param === 'number') {
                buffer = new Buffer(2);
                buffer.writeUInt16LE(param, 0);
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
    
    // --------------------------------------- //
    // - PARSE PACKETS RECEIVED FROM CLIENTS - //
    // --------------------------------------- //
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
    
    // ------------------------------------------- //
    // - INTERPRET PACKETS RECEIVED FROM CLIENTS - //
    // ------------------------------------------- //
    interpret: function(client, datapacket) {
        var header = PacketModels.header.parse(datapacket);
        
        // Resolve the packet based on the command received.
        switch (header.command.toUpperCase()) {            
            case "LATENCY":
                var data = PacketModels.latency.parse(datapacket);

                client.socket.write(packet.build(["LATENCY", data.time]));
            break;

            case "REGISTER":
                var data = PacketModels.register.parse(datapacket);

                Player.register(data.firstName, data.lastName, data.birthMonth, data.birthDay, data.birthYear, data.email, data.password, function(successful) {
                    if (successful) {
                        client.socket.write(packet.build(["REGISTER", "TRUE"]));
                    } else {
                        client.socket.write(packet.build(["REGISTER", "FALSE"]));
                    }
                });
            break;

            case "LOGIN":
                var data = PacketModels.login.parse(datapacket);

                Player.login(data.email, data.password, function(successful, player) {
                    if (successful) {
                        client.player = player;

                        client.socket.write(packet.build(["LOGIN", "TRUE"]));
                    } else {
                        client.socket.write(packet.build(["LOGIN", "FALSE"]));
                    }

                    // DEBUG: Log the login result.
                    // console.log('Login Result ' + successful);
                });
            break;

            case "SPAWN":
                var data = PacketModels.spawn.parse(datapacket);

                //console.log("Received spawn packet.");

                var success = false;

                Character.findOne({player_id: client.player.id, name: data.name}, function(err, character) {
                    if (!err && character) {
                        client.character = character;
                        success = true;
                    } else {
                        Character.create(client.player.id, data.name, "spr_Hero", 4, maps[config.starting_zone].room, maps[config.starting_zone].start_x, maps[config.starting_zone].start_y, 100, 100, 100, 100, 100, 100, 1, 10, 0, 50, function(successful, character) {
                            if (successful) {
                                client.character = character;
                                success = true;
                            }
                        });
                    }

                    if (success) {
                        client.enterroom(client.character.current_room);

                        client.character.save();

                        client.socket.write(packet.build(["SPAWN", client.character.name, client.character.current_room, client.character.pos_x, client.character.pos_y, client.character.health, client.character.maxHealth, client.character.thirst, client.character.maxThirst, client.character.hunger, client.character.maxHunger, client.character.woodcutting, client.character.maxWoodcutting, client.character.woodcuttingExp, client.character.maxWoodcuttingExp]));
                    } else {
                    }
                });

                // DEBUG: Log which player logged in.
                // console.log(client.character.username + " has logged in.");
            break;

            case "POSITION":
                var data = PacketModels.position.parse(datapacket);
                client.character.pos_x = data.target_x;
                client.character.pos_y = data.target_y;
                client.character.facing = data.facing;
                //client.player.save();
                client.broadcastroom(packet.build(["POSITION", client.character.name, data.target_x, data.target_y, data.facing]));
                //console.log(data);
            break;

            case "CHAT":
                var data = PacketModels.chat.parse(datapacket);
                
                console.log(client.character.name + " said: " + data.message);
            break;

            // ------------------------------ //
            // - UPDATE THE PLAYER'S THIRST - //
            // ------------------------------ //
            case "THIRST":
                var data = PacketModels.thirst.parse(datapacket);
                client.player.thirst += data.amount;
                
                if (client.player.thirst > 100) {
                    client.player.thirst = 100;
                }
                
                //client.player.save();
                client.socket.write(packet.build(["THIRST", client.player.thirst, client.player.maxThirst]));
            break;
            
            // ------------------------------ //
            // - UPDATE THE PLAYER'S HEALTH - //
            // ------------------------------ //
            case "HEALTH":
                var data = PacketModels.health.parse(datapacket);
                client.player.health += data.damage;
                //client.player.save();
                client.socket.write(packet.build(["HEALTH", client.player.health, client.player.maxHealth]));
            break;
            
            // ---------------------------------- //
            // - UPDATE THE PLAYER'S EXPERIENCE - //
            // ---------------------------------- //
            case "EXP":
                var data = PacketModels.exp.parse(datapacket);

                switch (data.skill) {
                    case "woodcutting":
                        client.player.woodcuttingExp += data.amount;

                        if (client.player.woodcuttingExp > client.player.maxWoodcuttingExp) {
                            client.player.woodcuttingExp -= client.player.maxWoodcuttingExp;

                            client.player.woodcutting += 1;

                            client.player.maxWoodcuttingExp *= 2;
                        }

                        client.socket.write(packet.build(["EXP", client.player.woodcuttingExp,
                                                    client.player.maxWoodcuttingExp, client.player.woodcutting]));
                    break;
                }

                // client.player.save();
            break;
        }

        // DEBUG: Log the packet being interpreted.
        // console.log("Interpret: " + header.command);
    }
};