'use client';

import { SocketContext } from '@/context/SocketContext';

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketContext.Provider value={{ socket: null, onlineUsers: null }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
