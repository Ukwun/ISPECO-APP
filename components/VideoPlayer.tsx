'use client';

import { useSocket } from '@/context/SocketContext';
import { useEffect, useRef } from 'react';

const VideoPlayer = () => {
  const { myStream, remoteStream, ongoingCall } = useSocket();
  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (myVideo.current && myStream) {
      myVideo.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-black aspect-video rounded-lg flex items-center justify-center text-white relative">
        <video ref={myVideo} playsInline muted autoPlay className="w-full h-full object-cover rounded-lg" />
        <p className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">You</p>
      </div>
      <div className="bg-black aspect-video rounded-lg flex items-center justify-center text-white relative">
        {remoteStream ? <video ref={remoteVideo} playsInline autoPlay className="w-full h-full object-cover rounded-lg" /> : <p>Waiting for remote user...</p>}
        <p className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">{ongoingCall?.participants.receiver.username || 'Remote User'}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;