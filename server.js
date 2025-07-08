import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import onCall from "./socket-events/onCall.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // ⚠️ Adjust this in production
      methods: ["GET", "POST"],
    },
  });

  let onlineUsers = [];

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.emit("getUsers", onlineUsers);

    socket.on("addNewUser", (clerkUser) => {
      console.log("🧍 New user:", clerkUser);
      if (!clerkUser?.id) {
        console.warn("❌ Invalid user attempted to connect");
        return;
      }

      const userIndex = onlineUsers.findIndex(u => u.id === clerkUser.id);

      if (userIndex !== -1) {
        // If user exists, update their socketId to handle reconnections
        onlineUsers[userIndex].socketId = socket.id;
        console.log("🔄 User reconnected, updated socketId:", onlineUsers[userIndex]);
      } else {
        // If user is new, add them to the list
        const newUser = {
          id: clerkUser.id,
          socketId: socket.id,
          username: clerkUser.username,
          profile: clerkUser.profile,
        };
        onlineUsers.push(newUser);
        console.log("➕ New user added to online list:", newUser);
      }

      io.emit("getUsers", onlineUsers);
    });

    socket.on("sendMessage", (message) => {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString(),
      };
      io.emit("receiveMessage", messageWithTimestamp);
    });

    socket.on("call", (participants) => {
      console.log("📞 Call initiated by", participants?.caller?.username);
      onCall(participants, io);
    });

    socket.on("answerCall", (participants) => {
      const callerSocketId = participants?.caller?.socketId;
      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", participants);
      }
    });

    socket.on("declineCall", (participants) => {
      const isCaller = participants?.caller?.socketId === socket.id;
      const otherSocketId = isCaller ? participants?.receiver?.socketId : participants?.caller?.socketId;
      if (otherSocketId) {
        io.to(otherSocketId).emit("callDeclined");
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
      onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
      io.emit("getUsers", onlineUsers);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
  });
});
