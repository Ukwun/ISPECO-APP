'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import VideoContainer from './VideoContainer';
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md';

const VideoCall = () => {
  const { localStream, remoteStream, endCall, ongoingCall } = useSocket();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidOn, setIsVidOn] = useState(true);

  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      setIsVidOn(videoTrack?.enabled ?? false);

      const audioTrack = localStream.getAudioTracks()[0];
      setIsMicOn(audioTrack?.enabled ?? false);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVidOn(videoTrack.enabled);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Show both local and remote video streams */}
      <div className="flex gap-6">
        {localStream && (
          <VideoContainer stream={localStream} isLocalStream={true} isOnCall={!!ongoingCall} />
        )}
        {remoteStream && (
          <VideoContainer stream={remoteStream} isLocalStream={false} isOnCall={!!ongoingCall} />
        )}
      </div>

      {/* Controls */}
      {ongoingCall && (
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMic}
            className={`p-2 rounded-full transition-colors ${isMicOn ? 'hover:bg-gray-200' : 'text-red-500 bg-red-100'}`}
          >
            {isMicOn ? <MdMic size={28} /> : <MdMicOff size={28} />}
          </button>

          <button className="px-4 py-2 bg-rose-500 text-white rounded" onClick={endCall}>
            End Call
          </button>

          <button
            onClick={toggleCamera}
            className={`p-2 rounded-full transition-colors ${isVidOn ? 'hover:bg-gray-200' : 'text-red-500 bg-red-100'}`}
          >
            {isVidOn ? <MdVideocam size={28} /> : <MdVideocamOff size={28} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
