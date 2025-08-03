'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import VideoContainer from './VideoContainer';
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md';

const VideoCall = () => {
  const { myStream, remoteStream, endCall, ongoingCall } = useSocket();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidOn, setIsVidOn] = useState(true);

  useEffect(() => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      setIsVidOn(videoTrack?.enabled ?? false);

      const audioTrack = myStream.getAudioTracks()[0];
      setIsMicOn(audioTrack?.enabled ?? false);
    }
  }, [myStream]);

  const toggleCamera = useCallback(() => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVidOn(videoTrack.enabled);
    }
  }, [myStream]);

  const toggleMic = useCallback(() => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, [myStream]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Show both local and remote video streams */}
      <div className="flex gap-6">
        {myStream && (
          <VideoContainer stream={myStream} isLocalStream={true} isOnCall={!!ongoingCall} />
        )}
        {remoteStream && (
          <VideoContainer stream={remoteStream} isLocalStream={false} isOnCall={!!ongoingCall} />
        )}
      </div>

      {/* Controls */}
      {ongoingCall && (
        <div className="flex items-center justify-center gap-6">
          <button onClick={toggleMic}>
            {isMicOn ? <MdMicOff size={28} /> : <MdMic size={28} />}
          </button>

          <button className="px-4 py-2 bg-rose-500 text-white rounded" onClick={endCall}>
            End Call
          </button>

          <button onClick={toggleCamera}>
            {isVidOn ? <MdVideocamOff size={28} /> : <MdVideocam size={28} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
