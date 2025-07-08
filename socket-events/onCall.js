const onCall = (participants, io) => {
  const receiver = participants?.receiver;
  const caller = participants?.caller;

  if (!receiver || !receiver.socketId) {
    console.warn("❌ Cannot emit call: missing receiver or socketId", participants);
    return;
  }

  console.log(`📞 Incoming call from ${caller?.username} to ${receiver?.username} (Socket ID: ${receiver.socketId})`);

  io.to(receiver.socketId).emit("incomingCall", participants);
};

export default onCall;
