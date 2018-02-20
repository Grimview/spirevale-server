var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

SALT_WORK_FACTOR = 10;

var bitmasonSchema = new Schema({
    logged_in: Boolean,

    username: {type: String, unique: true},
    password: String,
    
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

bitmasonSchema.pre('save', function (next) {
    var bitmason = this;
    
    if (!bitmason.isModified('password')) return next();
    
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        
        bcrypt.hash(bitmason.password, salt, function (err, hash) {
            if (err) return next(err);
            
            bitmason.password = hash;
            next();
        });
    });
});

bitmasonSchema.methods.comparePassword = function (received_password, callback) {
    bcrypt.compare(received_password, this.password, function (err, isMatch) {
        if (err) {
            return callback(err);
        }
        
        callback(undefined, isMatch);
    });
};

bitmasonSchema.statics.register = function(username, password, cb) {
    var new_bitmason = new Bitmason({
        logged_in: false,
        
        username: username,
        password: password,
        
        sprite: "spr_Hero",
        facing: 4,
        
        current_room: maps[config.starting_zone].room,
        
        pos_x: maps[config.starting_zone].start_x,
        pos_y: maps[config.starting_zone].start_y,
        
        health: 100,
        maxHealth: 100,
        
        thirst: 100,
        maxThirst: 100,
        
        hunger: 100,
        maxHunger: 100,
        
        woodcutting: 1,
        maxWoodcutting: 99,
        woodcuttingExp: 0,
        maxWoodcuttingExp: 100
    });
    
    new_bitmason.save(function(err){
        if (!err) {
            cb(true);
        } else {
            cb(false);
        }
    });
};

bitmasonSchema.statics.login = function(username, password, cb) {
    Bitmason.findOne({username: username}, function(err, bitmason){
        if (!err && bitmason) {
            bitmason.comparePassword(password, function (err, isMatch) {
                if (isMatch && isMatch == true) {
                    cb(true, bitmason);
                } else {
                    cb(false, null);
                }
            });
        } else {
            cb(false, null);
        }
    });
};

module.exports = Bitmason = gamedb.model('Bitmason', bitmasonSchema);