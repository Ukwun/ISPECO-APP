'use client';

import { useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Phone, PhoneOff } from 'lucide-react';

import { useSocket } from '@/context/SocketContext';
import { Button } from './ui/button';
import Avatar from './avatar';

const CallNotification = () => {
  const { user } = useUser();
  const { ongoingCall, handleAnswer, handleDecline } = useSocket();

  const isReceiver = ongoingCall?.isRinging && ongoingCall.participants.receiver.id === user?.id;

  useEffect(() => {
    if (isReceiver) {
      const timer = setTimeout(() => {
        handleDecline();
        toast.warning(`Missed call from ${ongoingCall?.participants.caller.username}.`);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isReceiver, ongoingCall, handleDecline]);

  useEffect(() => {
    console.log('📲 Ongoing call data:', ongoingCall);
  }, [ongoingCall]);

  const caller = useMemo(() => ongoingCall?.participants.caller, [ongoingCall]);

  if (!isReceiver) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white px-6 py-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 w-full max-w-sm text-center animate-fade-in">
        <div className="relative">
          <Avatar src={caller?.profile} size={100} />
          <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-green-500 animate-ping">
            <Phone size={20} className="text-white" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-slate-800 text-3xl font-bold">{caller?.username}</div>
          <p className="text-slate-500 text-sm">is calling you...</p>
        </div>

        <div className="flex gap-6 mt-4">
          <Button
            onClick={handleDecline}
            variant="destructive"
            size="lg"
            className="rounded-full p-4 h-auto"
          >
            <PhoneOff size={28} />
          </Button>
          <Button
            onClick={handleAnswer}
            variant="default"
            size="lg"
            className="bg-green-500 hover:bg-green-600 rounded-full p-4 h-auto"
          >
            <Phone size={28} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
