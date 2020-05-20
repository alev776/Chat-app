const path = require('path');
const http = require('http')
const express = require('express')
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
    console.log('New webSocket connection');

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        //io.to.emit - emite un evento a todos en un specific room
        //socke.broadcast.to.emit - emite un evento a todos en un specific room menos al que lo envia
        socket.emit('message', generateMessage('Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();

    });

    socket.on('sendMessage', (msj, callback) => {
        const filter = new Filter();
        const badWords = ['mamaguebo', 'mamañema', 'perra', 'guebo', 'coño, hijodeperra', 'semilla', 'rapa', 'singa', 'mamaguebaso'];
        filter.addWords(...badWords);

        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage(user.username, filter.clean(msj)));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
});


server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});