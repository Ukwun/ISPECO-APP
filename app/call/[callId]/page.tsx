'use client';

import { useSocket } from '@/context/SocketContext';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';

const CallPage = () => {
  const params = useParams();
  const router = useRouter();
  const { ongoingCall, endCall } = useSocket();
  const callId = params.callId;

  // If the user lands on this page but there's no active call state,
  // redirect them. This can happen on a page refresh.
  useEffect(() => {
    if (!ongoingCall) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [ongoingCall, router]);

  if (!ongoingCall) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-lg font-semibold">Call not found or has ended.</p>
        <p className="text-sm text-gray-500">Redirecting to the home page...</p>
      </div>
    );
  }

  const handleEndCall = () => {
    endCall();
    router.push('/');
  };

  return (
    <div className="p-4 flex flex-col items-center justify-between h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Video Call in Progress</h1>
        <p className="text-gray-500 mb-6">Call ID: {callId}</p>
      </div>

      <VideoPlayer />

      <Button onClick={handleEndCall} variant="destructive">
        End Call
      </Button>
    </div>
  );
};

export default CallPage;