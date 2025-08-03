'use client';

import { SocketContext } from '@/context/SocketContext';

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketContext.Provider
      value={{
        socket: null,
        onlineUsers: null,
        messages: [],
        sendMessage: () => {},
        ongoingCall: null,
        localStream: null,
        handleCall: () => {},
        handleAnswer: () => {},
        handleDecline: () => {},
        myStream: null,
        remoteStream: null,
        endCall: () => {},
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
