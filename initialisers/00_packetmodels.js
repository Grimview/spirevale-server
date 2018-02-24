var Parser = require('binary-parser').Parser;
var StringOptions = {length: 99, zeroTerminated: true};

module.exports = PacketModels = {
    header: new Parser().skip(1)
        .uint8("command", StringOptions),
    
    // #region Register
    register: new Parser().skip(1)
        .uint8("command", StringOptions)
        .string("firstName", StringOptions)
        .string("lastName", StringOptions)
        .string("month", StringOptions)
        .string("day", StringOptions)
        .string("year", StringOptions)
        .string("email", StringOptions)
        .string("password", StringOptions),
    // #endregion
    
    // #region Login
    login: new Parser().skip(1)
        .uint8("command", StringOptions)
        .string("email", StringOptions)
        .string("password", StringOptions),
    // #endregion
    
    // #region Character List
    character: new Parser().skip(1)
        .uint8("command", StringOptions),
    // #endregion
    
    // #region New Character
    newcharacter: new Parser().skip(1)
        .uint8("command", StringOptions)
        .string("name", StringOptions),
    // #endregion
    
    // #region Spawn
    spawn: new Parser().skip(1)
        .uint8("command", StringOptions)
        .string("name", StringOptions),
    // #endregion

    // #region Position
    position: new Parser().skip(1)
        .uint8("command", StringOptions)
        .uint16le("target_x", StringOptions)
        .uint16le("target_y", StringOptions)
        .uint16le("facing", StringOptions),
    // #endregion

    // #region Chat
    chat: new Parser().skip(1)
        .uint8("command", StringOptions)
        .string("message", StringOptions)
    // #endregion
}