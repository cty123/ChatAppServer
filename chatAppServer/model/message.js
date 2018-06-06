var db = require("./index");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = mongoose.Schema({
    Sender: {type: Number, ref: 'UserProfile'},
    Receiver: {type: Number, ref: 'UserProfile'},
    MessageText: {type: String},
    SendDate: {type: Date, require: true}
  });
  
  var Message = mongoose.model("Message", MessageSchema);

  module.exports = Message