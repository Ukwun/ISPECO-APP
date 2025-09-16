"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
// This setup assumes you are running this as a separate Node.js process.
const io = new socket_io_1.Server(3001, {
    cors: {
        origin: 'http://localhost:3000', // Your Next.js app URL
    },
});
let onlineUsers = [];
const addUser = (user, socketId) => {
    const userIndex = onlineUsers.findIndex((u) => u.id === user.id);
    if (userIndex === -1) {
        onlineUsers.push({ ...user, socketId });
        console.log('🟢 user connected', user.username);
    }
    else {
        onlineUsers[userIndex].socketId = socketId;
        console.log('🔄 user reconnected', user.username);
    }
};
const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
    console.log('🔴 user disconnected', socketId);
};
const getUser = (userId) => {
    return onlineUsers.find((user) => user.id === userId);
};
io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('addNewUser', (user) => {
        addUser(user, socket.id);
        io.emit('getUsers', onlineUsers);
    });
    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('getUsers', onlineUsers);
    });
    socket.on('sendMessage', (data) => {
        const user = getUser(data.receiverId);
        if (user) {
            io.to(user.socketId).emit('receiveMessage', data);
        }
    });
    socket.on('call', (data) => {
        const { receiver, ...rest } = data;
        const userToCall = getUser(receiver.id);
        console.log('📞 calling', receiver.username);
        if (userToCall) {
            io.to(userToCall.socketId).emit('incomingCall', { receiver, ...rest });
        }
    });
    socket.on('answerCall', (data) => {
        const { caller } = data;
        const callerUser = getUser(caller.id);
        if (callerUser) {
            io.to(callerUser.socketId).emit('callAccepted', data);
        }
    });
    socket.on('declineCall', (data) => {
        const { caller } = data;
        const callerUser = getUser(caller.id);
        if (callerUser) {
            io.to(callerUser.socketId).emit('callDeclined', data);
        }
    });
    socket.on('endCall', (data) => {
        const { otherUserId } = data;
        const otherUser = getUser(otherUserId);
        if (otherUser) {
            io.to(otherUser.socketId).emit('callEnded');
        }
    });
});
