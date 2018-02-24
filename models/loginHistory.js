var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-plugin-autoinc');

// #region Schema
var loginHistorySchema = new Schema({
    id: Number,
    player_id: Number,
    login_time: String,
    logout_time: String,
    login_data: String
});

loginHistorySchema.plugin(autoIncrement.plugin, {model: 'LoginHistory', field: 'id'});
// #endregion

// #region New Login History Entry
loginHistorySchema.statics.entry = function(cb) {
    var today = new Date();

    var new_history = new LoginHistory({
        player_id: 0,
        login_time: today,
        logout_time: today,
        login_data: ""
    });

    new_history.save(function(err){
        if (!err) {
            cb(true);
        } else {
            cb(false);
        }
    });
};
// #endregion

module.exports = LoginHistory = gamedb.model('LoginHistory', loginHistorySchema);