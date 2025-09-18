import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type { SocketUser } from "./types";

const app = express();
const server = createServer(app);

// Render provides PORT in env
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://ispeco-app.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

console.log(`🚀 Socket.IO server booting on port ${PORT}`);

let onlineUsers: SocketUser[] = [];

const addUser = (user: Omit<SocketUser, "socketId">, socketId: string) => {
  const userIndex = onlineUsers.findIndex((u) => u.id === user.id);
  if (userIndex === -1) {
    onlineUsers.push({ ...user, socketId });
    console.log("🟢 user connected", user.username);
  } else {
    onlineUsers[userIndex].socketId = socketId;
    console.log("🔄 user reconnected", user.username);
  }
};

const removeUser = (socketId: string) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  console.log("🔴 user disconnected", socketId);
};

const getUser = (userId: string) => {
  return onlineUsers.find((user) => user.id === userId);
};

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("addNewUser", (user: Omit<SocketUser, "socketId">) => {
    addUser(user, socket.id);
    io.emit("getUsers", onlineUsers);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", onlineUsers);
  });

  socket.on("sendMessage", (data) => {
    const user = getUser(data.receiverId);
    if (user) {
      io.to(user.socketId).emit("receiveMessage", data);
    }
  });

  socket.on("call", (data) => {
    const { receiver, ...rest } = data;
    const userToCall = getUser(receiver.id);
    console.log("📞 calling", receiver.username);
    if (userToCall) {
      io.to(userToCall.socketId).emit("incomingCall", { receiver, ...rest });
    }
  });

  socket.on("answerCall", (data) => {
    const { caller } = data;
    const callerUser = getUser(caller.id);
    if (callerUser) {
      io.to(callerUser.socketId).emit("callAccepted", data);
    }
  });

  socket.on("declineCall", (data) => {
    const { caller } = data;
    const callerUser = getUser(caller.id);
    if (callerUser) {
      io.to(callerUser.socketId).emit("callDeclined", data);
    }
  });

  socket.on("endCall", (data) => {
    const { otherUserId } = data;
    const otherUser = getUser(otherUserId);
    if (otherUser) {
      io.to(otherUser.socketId).emit("callEnded");
    }
  });
});

// Default route for health checks
import type { Request, Response } from "express";
app.get("/", (_: Request, res: Response) => {
  res.send("✅ ISPECO Socket.IO server is running");
});

try {
  server.listen(PORT, () => {
    console.log(`✅ [STARTUP] Server successfully listening on port ${PORT}`);
  });
} catch (err) {
  console.error('❌ [ERROR] Failed to start server:', err);
  process.exit(1);
}
