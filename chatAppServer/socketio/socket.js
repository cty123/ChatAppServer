var UserProfile = require('../model/user');
var Message = require('../model/message');

exports = module.exports = function(io){
    io.on('connection', function(socket){
        socket.on('send', function(message){
            let data = JSON.parse(message);
            let receiver_id = data.receiver;
            let messages = data.messages;
            UserProfile.findOne({ '_id': receiver_id }, function (err, receiver) {
                if (err) {
                    console.log(err);
                    return;
                }
                for(var i = 0; i < messages.length; i++) {
                    let text = messages[i].text;
                    let date = messages[i].createdAt;
                    console.log(date);
                    let sender_id = messages[i].user._id;
                    Message.create({
                        Sender: sender_id, 
                        Receiver: receiver_id, 
                        MessageText: text,
                        SendDate: new Date(date),
                    }, function (err, small) {
                        if (err) {
                            console.log(err);
                            return;
                        };
                    });
                }
            });
        });

        socket.on('load_conversation', function(message){
            let data = JSON.parse(message);
            let user_id = data.user_id;
            let client_id = data.client_id;
            console.log("user_id: " + user_id);
            console.log("client_id: " + client_id);
            UserProfile.findOne({_id: client_id})
            .then(receiver => {
                UserProfile.findOne({_id: user_id})
                .then(user=>{
                    Message.find().or([{ Sender: user_id, Receiver: client_id },
                        { Sender: client_id, Receiver: user_id }])
                    .then(messages => { 
                        var msg_pack = [];
                        for(let i = messages.length - 1; i >= 0 ; i--){
                            let msg_temp = {
                                _id: messages.length - 1 - i,
                                text: messages[i].MessageText,
                                createdAt: messages[i].SendDate,
                                user: {
                                    _id: messages[i].Sender,
                                    name: messages[i]._id === user_id? user.name:receiver.name,
                                    avatar: 'https://placeimg.com/140/140/any'    
                                }
                            }
                            msg_pack.push(msg_temp);
                        }
                        console.log(msg_pack);
                        socket.emit('update_conversation', msg_pack);
                    })
                    .catch(error => { console.log(error) })
                });
            })
            .catch(error => { console.log(error) })
        });

        socket.on('pull_notifications', function(message){
            let json = JSON.parse(message);
            let user_id = json.user_id;
            Message.find({Receiver: user_id})
            .populate('Sender', '_id name')
            .populate('Receiver', '_id name')
            .then(messages =>{
                console.log(messages);
                socket.emit('pull_notifications', messages);
            });
        });

        socket.on('disconnect', function(){
          console.log('user disconnected');
        });
    });
}
