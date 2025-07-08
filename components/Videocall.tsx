'use client';

import { useSocket } from "@/context/SocketContext";
import VideoContainer from "./VideoContainer";

const VideoCall = () => {
  const { myStream } = useSocket();

  return (
    <div>
      {myStream && (
        <VideoContainer
          stream={myStream}
          isLocalStream={true}
          isOnCall={false}
        />
      )}
    </div>
  );
};

export default VideoCall;
