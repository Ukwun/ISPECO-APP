const onCall = (participants, io) => {
  if (participants?.receiver?.socketId) {
    console.log("📞 Emitting incomingCall to receiver:", participants.receiver.socketId);
    io.to(participants.receiver.socketId).emit("incomingCall", participants);
  }
};

export default onCall;
// This function handles the call event by emitting an 'incomingCall' event to the receiver's socket ID.
// It expects `participants` to contain the receiver's socket ID and other relevant information.