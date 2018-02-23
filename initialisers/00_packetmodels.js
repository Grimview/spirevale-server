var Parser = require('binary-parser').Parser;
var StringOptions = {length: 99, zeroTerminated: true};

module.exports = PacketModels = {
    header: new Parser().skip(1)
        .string("command", StringOptions),
    
    latency: new Parser().skip(1)
        .string("command", StringOptions)
        .string("time", StringOptions),
    
    register: new Parser().skip(1)
        .string("command", StringOptions)
        .string("firstName", StringOptions)
        .string("lastName", StringOptions)
        .string("birthMonth", StringOptions)
        .string("birthDay", StringOptions)
        .string("birthYear", StringOptions)
        .string("email", StringOptions)
        .string("password", StringOptions),
    
    login: new Parser().skip(1)
        .string("command", StringOptions)
        .string("email", StringOptions)
        .string("password", StringOptions),
    
    spawn: new Parser().skip(1)
        .string("command", StringOptions)
        .string("name", StringOptions),
    
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