export type SocketUser = {
  id: string;
  socketId: string;
  username: string;
  profile: string;
};

export type PeerSignalData = {
  type: "offer" | "answer";
  sdp?: string;
  candidate?: RTCIceCandidateInit;
};

// WebRTC Participants involved in a call
export type Participants = {
  callId: string;
  signal?: PeerSignalData | any; // Prefer PeerSignalData if using your own signaling structure
  caller: SocketUser;
  receiver: SocketUser;
};

export type OngoingCall = {
  participants: Participants;
  isRinging: boolean;
};
