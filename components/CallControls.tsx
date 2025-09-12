'use client';

import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CallControls = () => {
  const { endCall } = useSocket();
  const router = useRouter();

  const handleEndCall = () => {
    endCall();
    router.push('/');
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <Button onClick={handleEndCall} variant="destructive" className="rounded-full h-16 w-16 p-4">
        <PhoneOff size={32} />
      </Button>
    </div>
  );
};

export default CallControls;
