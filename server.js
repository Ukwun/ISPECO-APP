import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let onlineUsers = [];

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

      const exists = onlineUsers.find((u) => u.id === user.id);
      if (exists) {
        exists.socketId = socket.id; // Update socket ID on reconnect
      } else {
        onlineUsers.push({ ...user, socketId: socket.id });
        console.log('➕ User joined:', user.username);
      }

      io.emit('getUsers', onlineUsers);
    });

    // 2. Initiate a call
    socket.on('call', (participants) => {
      const targetId = participants?.receiver?.socketId;
      if (targetId) {
        io.to(targetId).emit('incomingCall', participants);
        console.log('📞 Call sent to:', participants.receiver.username);
      }
    });

    // 3. Answer call
    socket.on('answerCall', (participants) => {
      const callerId = participants?.caller?.socketId;
      if (callerId) {
        io.to(callerId).emit('callAccepted', participants);
        console.log('✅ Call answered by:', participants.receiver.username);
      }
    });

    // 4. Decline call
    socket.on('declineCall', (participants) => {
      const targetId =
        participants?.caller?.socketId === socket.id
          ? participants?.receiver?.socketId
          : participants?.caller?.socketId;

      if (targetId) {
        io.to(targetId).emit('callDeclined');
        console.log('❌ Call declined.');
      }
    });

    // 5. WebRTC signaling
    socket.on('webrtcSignal', ({ targetSocketId, sdp }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtcSignal', { sdp });
        console.log('🔄 Signaling forwarded to', targetSocketId);
      }
    });

    // 6. Messaging
    socket.on('sendMessage', (message) => {
      const msg = {
        ...message,
        timestamp: new Date().toISOString(),
      };
      io.emit('receiveMessage', msg);
    });

    // 7. Disconnection
    socket.on('disconnect', () => {
      onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
      io.emit('getUsers', onlineUsers);
      console.log('👋 Disconnected:', socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://${hostname}:${port}`);
  });
});
