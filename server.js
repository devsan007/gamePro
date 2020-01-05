const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const users = [];

/* Room declaration - START */
/*  room object consist of three properties :
game name , user details , status (open,lock,deleted)
*/
const room_one = {  gameName : "Range The Warrior",users : [], status : "open"}

const room_two = {  gameName : "Fight the dead",users : [], status : "open"}

const room_three = {  gameName : "Dancing War",users : [], status : "open"}
/* Room declaration - END */

var counterValue = 90; // Time Counter


app.set('views','./views');
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    res.render('index',{
        roomOne:room_one,
        roomTwo : room_two,
        roomThree : room_three
    });
});

server.listen(3000);


/* Socket manipulation code - START */
io.on('connection',(socket)=>{
    socket.on('new-user',socketDetails => {
        
        switch (socketDetails.room) {
            case "room_one":
                if(room_one.users.length >= 3){
                    socket.broadcast.emit('room_one_booked');
                    socket.emit('room_one_booked');
                    room_one.status = 'lock';
                }else if(room_one.users.length < 3){
                    room_one.users.push(socketDetails.userName);
                    socket.broadcast.emit('roomone_user_connected',room_one.users);
                    if(room_one.users.length > 3){
                        room_one.status = 'lock';
                        socket.broadcast.emit('room_one_booked');
                    }
                }
            break;
            case "room_two":
                if(room_two.users.length >= 2){
                    socket.broadcast.emit('room_two_booked');
                    socket.emit('room_two_booked');
                    room_two.status = 'lock';
                }else if(room_two.users.length <= 2){
                   room_two.users.push(socketDetails.userName);
                   socket.broadcast.emit('roomtwo_user_connected',room_two.users);
                    if(room_two.users.length > 2){
                        room_two.status = 'lock';
                        socket.broadcast.emit('room_two_booked');
                    }
                }
            break;
            case "room_three":
                if(room_three.users.length >= 2){
                    socket.broadcast.emit('room_three_booked');
                    socket.emit('room_three_booked');
                    room_three.status = 'lock';
                }else if(room_three.users.length <= 2){
                    room_three.users.push(socketDetails.userName);
                    socket.broadcast.emit('roomthree_user_connected',room_three.users);
                    socket.emit('roomthree_user_connected',room_three.users);
                    if(room_three.users.length > 2){
                        room_three.status = 'lock';
                        socket.broadcast.emit('room_three_booked');
                    }
                }
            break;
        }
    });

    
    
    var counterTime = setInterval(()=>{
        if(counterValue <= 0){
            clearInterval(counterTime);
            if(room_one.users.length < 3){
                socket.emit('room_one_delete');
                room_one.status = 'deleted';
            }else if(room_one.users.length >= 3){
                room_one.status = 'lock';
                socket.emit('room_one_booked');
            }

            if(room_two.users.length < 2){
                room_two.status = 'deleted';
                socket.emit('room_two_delete');
            }else if(room_two.users.length > 2){
                room_two.status = 'lock';
                socket.emit('room_two_booked');
            }

            if(room_three.users.length < 2){
                room_three.status = 'deleted';
                socket.emit('room_three_delete');
            }else if(room_three.users.length > 2){
                room_three.status = 'lock';
                socket.emit('room_three_booked');
            }

        }else if(counterValue > -1){
            counterValue--;
            socket.emit('counter_value',counterValue);
        }
    },1000);

    socket.on('is_room_avaiable',roomName => {
       if(roomName == "room1"){
        socket.emit('room_one_status',room_one.status);
       }else if(roomName == "room2"){
        socket.emit('room_two_status',room_two.status);
       }else if(roomName == "room3"){
        socket.emit('room_three_status',room_three.status);
       }
    });

    socket.on('getAllRoomStatus',() => {
        roomStatus = {
            "room1" : room_one.status,
            "room2" : room_two.status,
            "room3" : room_three.status
        }
        socket.emit('allRoomStatus',roomStatus);
     });
});
/* Socket manipulation code - END */