import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let onlineUsers = [];

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // ⚠️ Set your frontend domain in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Emit current user list to the new socket
    socket.emit("getUsers", onlineUsers);

    // New user connection
    socket.on("addNewUser", (user) => {
      if (!user?.id) return;

      const existingIndex = onlineUsers.findIndex((u) => u.id === user.id);

      if (existingIndex !== -1) {
        onlineUsers[existingIndex].socketId = socket.id;
      } else {
        const newUser = {
          id: user.id,
          socketId: socket.id,
          username: user.username,
          profile: user.profile,
        };
        onlineUsers.push(newUser);
      }

      io.emit("getUsers", onlineUsers);
    });

    // Caller initiates the call
    socket.on("call", (participants) => {
      const receiverSocketId = participants?.receiver?.socketId;
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incomingCall", participants);
        console.log("📞 Call initiated to:", participants.receiver.username);
      }
    });

    // Receiver answers the call
    socket.on("answerCall", (participants) => {
      const callerSocketId = participants?.caller?.socketId;
      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", participants);
        console.log("✅ Call accepted by:", participants.receiver.username);
      }
    });

    // Either party declines the call
    socket.on("declineCall", (participants) => {
      const callerSocketId = participants?.caller?.socketId;
      const receiverSocketId = participants?.receiver?.socketId;
      const targetSocketId = socket.id === callerSocketId ? receiverSocketId : callerSocketId;

      if (targetSocketId) {
        io.to(targetSocketId).emit("callDeclined");
        console.log("❌ Call declined.");
      }
    });

    // WebRTC SDP and ICE signal exchange
    socket.on("webrtcSignal", ({ targetSocketId, sdp, ongoingCall }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtcSignal", {
          sdp,
          ongoingCall,
        });
        console.log("🔁 WebRTC signal forwarded.");
      }
    });

    // Text messages
    socket.on("sendMessage", (msg) => {
      const withTimestamp = {
        ...msg,
        timestamp: new Date().toISOString(),
      };
      io.emit("receiveMessage", withTimestamp);
    });

    // Disconnect logic
    socket.on("disconnect", () => {
      console.log("👋 Disconnected:", socket.id);
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit("getUsers", onlineUsers);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://${hostname}:${port}`);
  });
});
