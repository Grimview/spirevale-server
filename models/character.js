var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-plugin-autoinc');

var characterSchema = new Schema({
    id: Number,
    player_id: Number,
    name: {type: String, unique: true},

    sprite: String,
    facing: Number,
    
    current_room: String,
    
    pos_x: Number,
    pos_y: Number,
    
    health: Number,
    maxHealth: Number,
    
    thirst: Number,
    maxThirst: Number,
    
    hunger: Number,
    maxHunger: Number,
    
    woodcutting: Number,
    maxWoodcutting: Number,
    woodcuttingExp: Number,
    maxWoodcuttingExp: Number
});

characterSchema.plugin(autoIncrement.plugin, {model: 'Character', field: 'id'});

characterSchema.statics.create = function(player_id, name, sprite, facing, current_room, pos_x, pos_y, health, maxHealth, thirst, maxThirst, hunger, maxHunger, woodcutting, maxWoodcutting, woodcuttingExp, maxWoodcuttingExp, cb) {
    var new_character = new Character({
        player_id: player_id,
        name: name,
        sprite: sprite,
        facing: facing,
        
        current_room: current_room,
        
        pos_x: pos_x,
        pos_y: pos_y,
        
        health: health,
        maxHealth: maxHealth,
        
        thirst: thirst,
        maxThirst: maxThirst,
        
        hunger: hunger,
        maxHunger: maxHunger,
        
        woodcutting: woodcutting,
        maxWoodcutting: maxWoodcutting,
        woodcuttingExp: woodcuttingExp,
        maxWoodcuttingExp: maxWoodcuttingExp
    });

    new_character.save(function(err){
        if (!err) {
            cb(true, new_character);
        } else {
            cb(false, null);
        }
    });
};

module.exports = Character = gamedb.model('Character', characterSchema);