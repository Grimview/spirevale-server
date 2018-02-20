var Parser = require('binary-parser').Parser;
var StringOptions = {length: 99, zeroTerminated: true};

module.exports = PacketModels = {
    header: new Parser().skip(1)
        .string("command", StringOptions),
    
    login: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),
    
    register: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),
    
    position: new Parser().skip(1)
        .string("command", StringOptions)
        .int32le("target_x", StringOptions)
        .int32le("target_y", StringOptions)
        .int32le("facing", StringOptions),
    
    health: new Parser().skip(1)
        .string("command", StringOptions)
        .int32le("damage", StringOptions),
    
    thirst: new Parser().skip(1)
        .string("command", StringOptions)
        .int32le("amount", StringOptions),
    
    chat: new Parser().skip(1)
        .string("command", StringOptions)
        .string("message", StringOptions),
    
    exp: new Parser().skip(1)
        .string("command", StringOptions)
        .string("skill", StringOptions)
        .int32le("amount", StringOptions)
}