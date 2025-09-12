import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let onlineUsers = [];

const getUser = (userId) => onlineUsers.find((user) => user.id === userId);

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Replace with specific domain in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Connected:', socket.id);

    // 1. New user joins
    socket.on('addNewUser', (user) => {
      if (!user?.id) return;
      const existingUser = onlineUsers.find((u) => u.id === user.id);
      if (existingUser) {
        existingUser.socketId = socket.id; // Update socket ID on reconnect
        console.log('🔄 User reconnected:', user.username);
      } else {
        onlineUsers.push({ ...user, socketId: socket.id });
        console.log('➕ User joined:', user.username);
      }
      io.emit('getUsers', onlineUsers);
    });

    // 2. Initiate a call
    socket.on('call', (participants) => {
      const userToCall = getUser(participants?.receiver?.id);
      if (userToCall?.socketId) {
        io.to(userToCall.socketId).emit('incomingCall', participants);
        console.log('📞 Call sent to:', participants.receiver.username);
      }
    });

    // 3. Answer call
    socket.on('answerCall', (participants) => {
      const callerUser = getUser(participants?.caller?.id);
      if (callerUser?.socketId) {
        io.to(callerUser.socketId).emit('callAccepted', participants);
        console.log('✅ Call answered by:', participants.receiver.username);
      }
    });

    // 4. Decline call
    socket.on('declineCall', (participants) => {
      const callerUser = getUser(participants?.caller?.id);
      if (callerUser?.socketId) {
        io.to(callerUser.socketId).emit('callDeclined');
        console.log('❌ Call declined by receiver.');
      }
    });

    // 5. End call
    socket.on('endCall', ({ otherUserId }) => {
      const otherUser = getUser(otherUserId);
      if (otherUser?.socketId) {
        io.to(otherUser.socketId).emit('callEnded');
        console.log('👋 Call ended with', otherUser.username);
      }
    });

    // 6. WebRTC signaling (This was unused, simple-peer handles it with trickle:false)
    // socket.on('webrtcSignal', ({ targetSocketId, sdp }) => { ... });

    // 7. Messaging
    socket.on('sendMessage', (message) => {
      const msg = {
        ...message,
        timestamp: new Date().toISOString(),
      };
      io.emit('receiveMessage', msg);
    });

    // 8. Disconnection
    socket.on('disconnect', () => {
      onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
      io.emit('getUsers', onlineUsers);
      console.log('🔌 Disconnected:', socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://${hostname}:${port}`);
  });
});
