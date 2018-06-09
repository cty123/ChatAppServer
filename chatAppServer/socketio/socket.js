var UserProfile = require('../model/user');
var Message = require('../model/message');

exports = module.exports = function(io){
    io.on('connection', function(socket){
        console.log(socket.handshake.query);
        let _user_id = socket.handshake.query.user_id;
        UserProfile.findOne({'_id':_user_id})
        .then(user=>{
            user.socket_id = socket.id;
            user.save();
        })

        socket.on('send', function(message){
            let data = JSON.parse(message);
            let receiver_id = data.receiver;
            let messages = data.messages;
            console.log(messages);
            UserProfile.findOne({ '_id': receiver_id })
            .then(receiver=>{
                if (receiver) {
                    for(var i = 0; i < messages.length; i++) {
                        let text = messages[i].text;
                        let date = messages[i].createdAt;
                        let sender_id = messages[i].user._id;
                        var msg = {
                            Sender: sender_id, 
                            Receiver: receiver._id, 
                            MessageText: text,
                            SendDate: new Date(date),
                        }
                        Message.create(msg);
                        // Find receiver's socket
                        let socket_id = receiver.socket_id;
                        if (socket_id){
                            socket.broadcast.to(socket_id).emit('new_message', msg);
                        }
                    }
                } else {
                    console.log("Receiver does not exist");
                } 
            });
        });

        socket.on('update_conversation', function(message){
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
                                _id: i,
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
            Message.find().or([{Receiver: user_id}, {Sender: user_id}])
            .populate('Sender', '_id name')
            .populate('Receiver', '_id name')
            .then(messages =>{
                let notifications = [];
                for(let i = 0; i<messages.length; i++){
                    if (messages[i].Sender._id == user_id){
                        notifications[messages[i].Receiver._id] = {
                            id: messages[i].Receiver._id,
                            name: messages[i].Receiver.name,
                            text: messages[i].MessageText,
                            date: messages[i].SendDate
                        }
                    }else {
                        notifications[messages[i].Sender._id] = {
                            id: messages[i].Sender._id,
                            name: messages[i].Sender.name,
                            text: messages[i].MessageText,
                            date: messages[i].SendDate
                        }
                    }
                }
                console.log(notifications);
                socket.emit('pull_notifications', notifications);
            });
        });

        socket.on('disconnect', function(){
            UserProfile.findOne({'socket_id':socket.id})
                .then(user=>{
                user.socket_id = null;
                user.save();
            })
            console.log('user disconnected');
        });
    });
}
