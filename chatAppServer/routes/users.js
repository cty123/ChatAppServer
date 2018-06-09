var express = require('express');
var router = express.Router();
var UserProfile = require('../model/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next){
  let username = req.body.username;
  let password = req.body.password;
  UserProfile.findOne({name: username, password: password})
  .then(user=> {
    if (!user){
      res.json({
        res: 'failed',
        msg: 'Incorrect username or password'
      });
    }else {
      res.json({
        res: 'success',
        user_id: user._id
      });      
    }
  });
});

module.exports = router;
