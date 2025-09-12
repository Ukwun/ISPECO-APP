'use client';

import { useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { motion } from 'framer-motion';
import { PhoneOff } from 'lucide-react';

const CallRoomPage = () => {
  const { myStream, remoteStream, endCall } = useSocket();

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <motion.div
      className="h-screen w-full bg-gradient-to-br from-black to-gray-900 flex flex-col items-center justify-center gap-8 p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative border border-white/10 rounded-xl overflow-hidden">
          {myStream ? (
            <video
              ref={myVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-white/60">
              Waiting for your camera...
            </div>
          )}
        </div>

        <div className="relative border border-white/10 rounded-xl overflow-hidden">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-white/60">
              Waiting for the other user...
            </div>
          )}
        </div>
      </div>

      <motion.button
        onClick={endCall}
        className="flex items-center gap-2 mt-4 bg-red-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-xl hover:bg-red-700 transition-all"
        whileTap={{ scale: 0.95 }}
      >
        <PhoneOff size={20} />
        End Call
      </motion.button>
    </motion.div>
  );
};

export default CallRoomPage;
