'use client';

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { io, Socket as IOSocket } from 'socket.io-client';
import Peer, { SignalData } from 'simple-peer';
import { toast } from 'sonner';
import { OngoingCall, Participants, SocketUser } from '@/types';

interface ISocketContext {
  socket: IOSocket | null;
  onlineUsers: SocketUser[] | null;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  ongoingCall: OngoingCall | null;
  initializeLocalStream: () => Promise<MediaStream | null>;
  handleCall: (user: SocketUser) => void;
  handleAnswer: () => void;
  handleDecline: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  endCall: () => void;
}

type ChatMessage = {
  text: string;
  senderId: string;
  senderUsername: string;
  senderProfile: string;
  timestamp: string;
};

export const SocketContext = createContext<ISocketContext | null>(null);

export const SocketContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const router = useRouter();
  const [socket, setSocket] = useState<IOSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
    ],
  };

  const currentSocketUser = onlineUsers?.find((u) => u.id === user?.id);

  const initializeLocalStream = useCallback(async () => {
    if (localStream) return localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      toast.error('Could not access camera or microphone.');
      return null;
    }
  }, [localStream]);

  const cleanupCall = useCallback(() => {
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    peer?.destroy();
    setPeer(null);
    setRemoteStream(null);
    setOngoingCall(null);
    setLocalStream(null);
  }, [localStream, remoteStream, peer]);

  const endCall = useCallback(() => {
    if (socket && ongoingCall && user) {
      const otherUserId =
        ongoingCall.participants.caller.id === user.id
          ? ongoingCall.participants.receiver.id
          : ongoingCall.participants.caller.id;
      socket.emit('endCall', { otherUserId });
    }
    cleanupCall();
  }, [socket, ongoingCall, user, cleanupCall]);

  const handleCall = useCallback(
    async (receiver: SocketUser) => {
      if (!currentSocketUser || !socket) return;

      const stream = await initializeLocalStream();
      if (!stream) {
        // The error toast is already handled inside initializeLocalStream
        return;
      }

      const callId = crypto.randomUUID();
      const newPeer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
        config: ICE_SERVERS,
      });

      newPeer.on('signal', (signal) => {
        const participants: Participants = { callId, caller: currentSocketUser, receiver, signal };
        socket.emit('call', participants);
        setOngoingCall({ participants, isRinging: false });
      });

      newPeer.on('stream', setRemoteStream);
      newPeer.on('close', endCall);
      newPeer.on('error', (err) => {
        toast.error(`Call failed: ${err.message}`);
        endCall();
      });

      setPeer(newPeer);
    },
    [socket, currentSocketUser, initializeLocalStream, endCall],
  );

  const handleDecline = useCallback(() => {
    if (!socket || !ongoingCall) return;
    socket.emit('declineCall', ongoingCall.participants);
    cleanupCall();
  }, [socket, ongoingCall, cleanupCall]);

  const handleAnswer = useCallback(async () => {
    if (!socket || !ongoingCall) return;

    const stream = await initializeLocalStream();
    if (!stream) {
      // Error is already toasted inside initializeLocalStream.
      // Decline the call automatically if permission is denied.
      handleDecline(); // This is now safe to call
      return;
    }

    const newPeer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: ICE_SERVERS,
    });

    newPeer.on('signal', (signal) => {
      const updated = { ...ongoingCall.participants, signal };
      socket.emit('answerCall', updated);
    });

    newPeer.on('stream', setRemoteStream);
    newPeer.on('close', endCall);
    newPeer.on('error', (err) => {
      toast.error(`Call error: ${err.message}`);
      endCall();
    });

    newPeer.signal(ongoingCall.participants.signal);
    setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : null));
    setPeer(newPeer);
    router.push(`/call/${ongoingCall.participants.callId}`);
  }, [socket, ongoingCall, initializeLocalStream, handleDecline, endCall, router]);

  const sendMessage = (text: string) => {
    if (socket && currentSocketUser) {
      socket.emit('sendMessage', {
        text,
        senderId: currentSocketUser.id,
        senderUsername: currentSocketUser.username,
        senderProfile: currentSocketUser.profile,
      });
    }
  };

  useEffect(() => {
    // Connect to the deployed backend URL in production, or localhost in development
  // Connect to the serverless Socket.IO endpoint
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL || '/api/socket';
  const newSocket = io(socketUrl, { path: '/api/socket' });
  setSocket(newSocket);

    return function cleanup(): void {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const socketUser = {
      id: user.id,
      username: user.username || user.firstName || 'Anonymous',
      profile: user.imageUrl,
    };

    const onConnect = () => {
      socket.emit('addNewUser', socketUser);
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('getUsers', (users: SocketUser[]) => setOnlineUsers(users));
    socket.on('receiveMessage', (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on('incomingCall', (participants: Participants) => {
      setOngoingCall({ participants, isRinging: true });
    });
    socket.on('callAccepted', (participants: Participants) => {
      // This is the crucial part: The caller's peer must be signaled with the receiver's answer.
      if (peer && participants.signal) {
        peer.signal(participants.signal);
      }
      setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : null));
      router.push(`/call/${participants.callId}`);
    });
    socket.on('callDeclined', () => {
      toast.error('Call was declined.');
      cleanupCall();
    });
    socket.on('callEnded', () => {
      toast.info('The other user has ended the call.');
      cleanupCall();
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('getUsers');
      socket.off('receiveMessage');
      socket.off('incomingCall');
      socket.off('callAccepted');
      socket.off('callDeclined');
      socket.off('callEnded');
    };
  }, [socket, user, peer, cleanupCall, router]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        messages,
        sendMessage,
        ongoingCall,
        localStream,
        initializeLocalStream,
        handleCall,
        handleAnswer,
        handleDecline,
        remoteStream,
        endCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketContextProvider');
  return context;
};
