var express = require('express');
var router = express.Router();
const Message = require('../model/message');

/* GET users listing. */
router.post('/', function(req, res, next) {
    let user_id = req.body.user_id;
    Message.find({Receiver: user_id})
    .populate('Sender', '_id name')
    .populate('Receiver', '_id name')
    .then(messages =>{
        console.log(messages);
        res.json(messages);
    });
});

module.exports = router;
