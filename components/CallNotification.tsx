"use client";

import { useSocket } from '@/context/SocketContext';
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import Avatar from './avatar';
import { Phone, PhoneOff, PhoneCall } from 'lucide-react';

const CallNotification = () => {
  const { ongoingCall, handleAnswer, handleDecline } = useSocket();

  useEffect(() => {
    if (ongoingCall?.isRinging) {
      const timer = setTimeout(() => {
        handleDecline();
        toast.warning(`Missed call from ${ongoingCall.participants.caller.username}.`);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [ongoingCall, handleDecline]);

  useEffect(() => {
    console.log("📲 Ongoing call data:", ongoingCall);
  }, [ongoingCall]);

  const caller = useMemo(() => ongoingCall?.participants.caller, [ongoingCall]);
  const receiver = useMemo(() => ongoingCall?.participants.receiver, [ongoingCall]);

  if (!ongoingCall) return null;

  const isReceiver = ongoingCall.isRinging;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white px-6 py-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 w-full max-w-sm text-center animate-fade-in">
        <div className="relative">
          <Avatar src={isReceiver ? caller?.profile : receiver?.profile} size={100} />
          <div className={`absolute -bottom-2 -right-2 p-2 rounded-full ${isReceiver ? 'bg-green-500' : 'bg-blue-500'} animate-ping`}>
            {isReceiver ? <Phone size={20} className="text-white" /> : <PhoneCall size={20} className="text-white" />}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-slate-800 text-3xl font-bold">
            {isReceiver ? caller?.username : receiver?.username}
          </div>
          <p className="text-slate-500 text-sm">
            {isReceiver ? "is calling you..." : "Calling... Waiting for answer"}
          </p>
        </div>

        {isReceiver ? (
          <div className="flex gap-6 mt-4">
            <Button onClick={handleDecline} variant="destructive" size="lg" className="rounded-full p-4 h-auto">
              <PhoneOff size={28} />
            </Button>
            <Button onClick={handleAnswer} variant="default" size="lg" className="bg-green-500 hover:bg-green-600 rounded-full p-4 h-auto">
              <Phone size={28} />
            </Button>
          </div>
        ) : (
          <>
            <Button
              onClick={handleDecline}
              variant="destructive"
              size="lg"
              className="rounded-full p-4 h-auto mt-4"
            >
              <PhoneOff size={28} />
            </Button>
            <span className="text-xs text-slate-400 italic mt-2">
              "Hang tight — they're deciding whether to pick up."
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default CallNotification;
