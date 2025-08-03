import { useEffect, useRef } from "react";

interface IVideoContainer {
  stream: MediaStream | null;
  isLocalStream: boolean;
  isOnCall: boolean;
}

const VideoContainer = ({ stream, isLocalStream }: IVideoContainer) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && stream.getTracks().length > 0) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative">
      {stream ? (
        <video
          ref={videoRef}
          className="rounded border w-[800px]"
          autoPlay
          playsInline
          muted={isLocalStream}
        />
      ) : (
        <div className="w-[800px] h-[450px] bg-gray-200 flex items-center justify-center rounded border">
          <p className="text-gray-500">No video stream</p>
        </div>
      )}
    </div>
  );
};

export default VideoContainer;
