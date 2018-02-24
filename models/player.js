var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var autoIncrement = require('mongoose-plugin-autoinc');

SALT_WORK_FACTOR = 10;

// #region Schema
var playerSchema = new Schema({
    id: Number,
    firstName: String,
    lastName: String,
    birthMonth: String,
    birthDay: String,
    birthYear: String,
    email: {type: String, unique: true},
    password: String
});

playerSchema.plugin(autoIncrement.plugin, {model: 'Player', field: 'id'});
// #endregion

// #region Save
playerSchema.pre('save', function (next) {
    var player = this;
    
    if (!player.isModified('password')) return next();
    
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        
        bcrypt.hash(player.password, salt, function (err, hash) {
            if (err) return next(err);
            
            player.password = hash;
            next();
        });
    });
});
// #endregion

// #region Compare Passwords
playerSchema.methods.comparePassword = function (received_password, callback) {
    bcrypt.compare(received_password, this.password, function (err, isMatch) {
        if (err) {
            return callback(err);
        }
        
        callback(undefined, isMatch);
    });
};
// #endregion

// #region Register New Account
playerSchema.statics.register = function(firstName, lastName, birthMonth, birthDay, birthYear, email, password, cb) {
    var new_player = new Player({
        firstName: firstName,
        lastName: lastName,
        birthMonth: birthMonth,
        birthDay: birthDay,
        birthYear: birthYear,
        email: email,
        password: password
    });
    
    new_player.save(function(err){
        if (!err) {
            cb(true);
        } else {
            cb(false);
        }
    });
};
// #endregion

// #region Login
playerSchema.statics.login = function(email, password, cb) {
    Player.findOne({email: email}, function(err, player){
        if (!err && player) {
            player.comparePassword(password, function (err, isMatch) {
                if (isMatch && isMatch == true) {
                    cb(true, player);
                } else {
                    cb(false, null);
                }
            });
        } else {
            cb(false, null);
        }
    });
};
// #endregion

module.exports = Player = gamedb.model('Player', playerSchema);