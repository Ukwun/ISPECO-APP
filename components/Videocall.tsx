'use client';

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import VideoContainer from "./VideoContainer";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";

const VideoCall = () => {
  const { myStream } = useSocket();
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
    <div>
      {myStream && (
        <VideoContainer
          stream={myStream}
          isLocalStream={true}
          isOnCall={false}
        />
      )}

      <div className="mt-8 flex items-center justify-center">
        <button onClick={toggleMic}>
          {isMicOn ? <MdMicOff size={28} /> : <MdMic size={28} />}
        </button>

        <button
          className="px-4 py-2 bg-rose-500 text-white rounded mx-4"
          onClick={() => {
            // Add end call functionality here
          }}
        >
          End Call
        </button>

        <button onClick={toggleCamera}>
          {isVidOn ? <MdVideocamOff size={28} /> : <MdVideocam size={28} />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
