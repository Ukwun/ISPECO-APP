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
  const io = new Server(httpServer); // <-- LOCAL reference
  let onlineUsers = [];

  io.on("connection", (socket) => {
    console.log("✅ Client connected");

    socket.emit("getUsers", onlineUsers);

    socket.on("addNewUser", (clerkUser) => {
      if (clerkUser?.id && !onlineUsers.some(user => user.id === clerkUser.id)) {
        onlineUsers.push({
          id: clerkUser.id,
          socketId: socket.id,
          username: clerkUser.username,
          profile: clerkUser.profile,
        });
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
      onCall(participants, io); // ✅ Pass io explicitly here
    });

    socket.on("answerCall", (participants) => {
      if (participants?.caller?.socketId) {
        io.to(participants.caller.socketId).emit("callAccepted", participants);
      }
    });

    socket.on("declineCall", (participants) => {
      const isCaller = participants.caller.socketId === socket.id;
      const otherParticipant = isCaller ? participants.receiver : participants.caller;
      if (otherParticipant?.socketId) {
        io.to(otherParticipant.socketId).emit("callDeclined");
      }
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
      io.emit("getUsers", onlineUsers);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
  });
});
