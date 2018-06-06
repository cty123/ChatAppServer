var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ChatApp');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Mongodb connection: Success");
});

module.exports = db