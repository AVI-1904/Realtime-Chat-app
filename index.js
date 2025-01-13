const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Update with your frontend's URL
        methods: ["GET", "POST"],
    },
});

const users = {}; // Store connected users {socketId: username}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user login
    socket.on('login', (username) => {
        users[socket.id] = username;
        io.emit('user_list', Object.values(users)); // Broadcast updated user list
        console.log(`${username} logged in.`);
    });

    // Handle private messages
    socket.on('private_message', ({ toUsername, message }) => {
        const recipientSocketId = Object.keys(users).find(
            (id) => users[id] === toUsername
        );

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_private_message', {
                from: users[socket.id],
                message,
            });
            console.log(`Message from ${users[socket.id]} to ${toUsername}: ${message}`);
        } else {
            console.log(`Recipient ${toUsername} not found.`);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
        io.emit('user_list', Object.values(users)); // Broadcast updated user list
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
