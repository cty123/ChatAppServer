var db = require("./index");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(db);

var UserProfileSchema = mongoose.Schema({
    name: {type: String, required: true},
    password: {type: String, required: true},
    email: String,
    nickname: String,
});

UserProfileSchema.plugin(autoIncrement.plugin, 'UserProfile');
var UserProfile = mongoose.model("UserProfile", UserProfileSchema);

module.exports = UserProfile