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
            // ------------------------------ //
            // - UPDATE THE PLAYER'S THIRST - //
            // ------------------------------ //
            case "THIRST":
                var data = PacketModels.thirst.parse(datapacket);
                client.bitmason.thirst += data.amount;
                
                if (client.bitmason.thirst > 100) {
                    client.bitmason.thirst = 100;
                }
                
                //client.bitmason.save();
                client.socket.write(packet.build(["THIRST", client.bitmason.thirst, client.bitmason.maxThirst]));
            break;

            // -------------------------------- //
            // - UPDATE THE PLAYER'S POSITION - //
            // -------------------------------- //
            case "POSITION":
                var data = PacketModels.position.parse(datapacket);
                client.bitmason.pos_x = data.target_x;
                client.bitmason.pos_y = data.target_y;
                client.bitmason.facing = data.facing;
                //client.bitmason.save();
                client.broadcastroom(packet.build(["POSITION", client.bitmason.username, data.target_x, data.target_y,
                                            data.facing]));
                //console.log(data);
            break;
            
            // ------------------------------ //
            // - UPDATE THE PLAYER'S HEALTH - //
            // ------------------------------ //
            case "HEALTH":
                var data = PacketModels.health.parse(datapacket);
                client.bitmason.health += data.damage;
                //client.bitmason.save();
                client.socket.write(packet.build(["HEALTH", client.bitmason.health, client.bitmason.maxHealth]));
            break;
            
            // ----------------------- //
            // - SEND A CHAT MESSAGE - //
            // ----------------------- //
            case "CHAT":
                var data = PacketModels.chat.parse(datapacket);
                
                console.log(client.bitmason.username + " said: " + data.message);
            break;
            
            // ---------------------------------- //
            // - UPDATE THE PLAYER'S EXPERIENCE - //
            // ---------------------------------- //
            case "EXP":
                var data = PacketModels.exp.parse(datapacket);

                switch (data.skill) {
                    case "woodcutting":
                        client.bitmason.woodcuttingExp += data.amount;

                        if (client.bitmason.woodcuttingExp > client.bitmason.maxWoodcuttingExp) {
                            client.bitmason.woodcuttingExp -= client.bitmason.maxWoodcuttingExp;

                            client.bitmason.woodcutting += 1;

                            client.bitmason.maxWoodcuttingExp *= 2;
                        }

                        client.socket.write(packet.build(["EXP", client.bitmason.woodcuttingExp,
                                                    client.bitmason.maxWoodcuttingExp, client.bitmason.woodcutting]));
                    break;
                }

                // client.bitmason.save();
            break;

            // --------------------- //
            // - LOGIN TO THE GAME - //
            // --------------------- //
            case "LOGIN":
                // Parse the data packet using the login packet model.
                var data = PacketModels.login.parse(datapacket);

                // Call the bitmason model login function.
                Bitmason.login(data.username, data.password, function(successful, bitmason) {
                    if (successful) {
                        // Set the bitmason to the bitmason logging in.
                        // Add the bitmason to it's room based on the database.
                        // Send a login packet with a true result.
                        client.bitmason = bitmason;
                        client.bitmason.logged_in = true;
                        client.enterroom(client.bitmason.current_room);
                        client.bitmason.save();
                        client.socket.write(packet.build(["LOGIN", "TRUE", client.bitmason.current_room, client.bitmason.pos_x,
                                                    client.bitmason.pos_y, client.bitmason.username, client.bitmason.health,
                                                    client.bitmason.maxHealth, client.bitmason.thirst, client.bitmason.maxThirst,
                                                    client.bitmason.hunger, client.bitmason.maxHunger, client.bitmason.woodcutting,
                                                    client.bitmason.maxWoodcutting, client.bitmason.woodcuttingExp,
                                                    client.bitmason.maxWoodcuttingExp]));

                        // DEBUG: Log which bitmason logged in.
                        // console.log(client.bitmason.username + " has logged in.");
                    } else {
                        // Send a login packet with a false result.
                        client.socket.write(packet.build(["LOGIN", "FALSE"]));
                    }

                    // DEBUG: Log the login result.
                    // console.log('Login Result ' + successful);
                });
            break;

            // ------------------------- //
            // - REGISTER FOR THE GAME - //
            // ------------------------- //
            case "REGISTER":
                var data = PacketModels.register.parse(datapacket);
                Bitmason.register(data.username, data.password, function(successful) {
                    if (successful) {
                        client.socket.write(packet.build(["REGISTER", "TRUE"]));
                    } else {
                        client.socket.write(packet.build(["REGISTER", "FALSE"]));
                    }
                });
            break;
        }

        // DEBUG: Log the packet being interpreted.
        // console.log("Interpret: " + header.command);
    }
};