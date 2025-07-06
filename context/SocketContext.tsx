"use client";

import { createContext, useContext, ReactNode, useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { io, Socket as IOSocket } from "socket.io-client";
import Peer from "simple-peer";
import { toast } from "sonner";
import { OngoingCall, Participants, SocketUser } from "@/types";

interface ISocketContext {
  socket: IOSocket | null;
  onlineUsers: SocketUser[] | null;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  ongoingCall: OngoingCall | null;
  handleCall: (user: SocketUser) => void;
  handleAnswer: () => void;
  handleDecline: () => void;
  myStream: MediaStream | null;
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

export const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const router = useRouter();
  const [socket, setSocket] = useState<IOSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);

  const currentSocketUser = onlineUsers?.find((u) => u.id === user?.id);

  const endCall = useCallback(() => {
    myStream?.getTracks().forEach((track) => track.stop());
    peer?.destroy();
    setPeer(null);
    setMyStream(null);
    setRemoteStream(null);
    setOngoingCall(null);
  }, [myStream, peer]);

  const handleCall = useCallback(async (receiver: SocketUser) => {
    if (!currentSocketUser || !socket) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);

      const callId = crypto.randomUUID();
      const newPeer = new Peer({ initiator: true, trickle: false, stream });

      newPeer.on("signal", (signal) => {
        const participants: Participants = { callId, caller: currentSocketUser, receiver, signal };
        socket.emit("call", participants);
        setOngoingCall({ participants, isRinging: false });
      });

      newPeer.on("stream", (stream) => setRemoteStream(stream));
      newPeer.on("close", endCall);
      newPeer.on("error", (err) => {
        toast.error(`Call failed: ${err.message}`);
        console.error(err);
        endCall();
      });

      setPeer(newPeer);
    } catch (error) {
      toast.error("Could not start call. Please ensure you have a camera and microphone enabled.");
      console.error("Error getting user media:", error);
    }
  }, [socket, currentSocketUser, endCall]);

  const handleAnswer = useCallback(async () => {
    if (!socket || !ongoingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);

      const newPeer = new Peer({ initiator: false, trickle: false, stream });

      newPeer.on("signal", (signal) => {
          const updatedParticipants = {
          ...ongoingCall.participants,
          signal,
        };
        console.log('Answering call with participants:', updatedParticipants);

        socket.emit('answerCall', updatedParticipants);
      });

      newPeer.on('stream', (stream) => setRemoteStream(stream));
      newPeer.on('close', endCall);
      newPeer.on('error', (err) => {
        toast.error(`Call error: ${err.message}`);
        console.error(err);
        endCall();
      });

      newPeer.signal(ongoingCall.participants.signal);
      setOngoingCall((prev) => prev ? { ...prev, isRinging: false } : null);
      setPeer(newPeer);
      router.push(`/call/${ongoingCall.participants.callId}`);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Could not access camera/microphone.");
    }
  }, [socket, ongoingCall, endCall, router]);

  const handleDecline = useCallback(() => {
    if (!socket || !ongoingCall) return;
    socket.emit("declineCall", ongoingCall.participants);
    endCall();
  }, [socket, ongoingCall, endCall]);

  const sendMessage = (text: string) => {
    if (socket && currentSocketUser) {
      socket.emit("sendMessage", {
        text,
        senderId: currentSocketUser.id,
        senderUsername: currentSocketUser.username,
        senderProfile: currentSocketUser.profile,
      });
    }
  };

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      if (user) {
        const socketUser = {
          id: user.id,
          username: user.username || user.firstName || "Anonymous",
          profile: user.imageUrl,
        };
        console.log("🔗 Emitting addNewUser", socketUser);
        socket.emit("addNewUser", socketUser);
      }
    };

    // Handle case where socket is already connected
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("getUsers", (users: SocketUser[]) => setOnlineUsers(users));
    socket.on("receiveMessage", (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on("incomingCall", (participants: Participants) => {
      console.log("✅ Receiver got incoming call!", participants);
      setOngoingCall({ participants, isRinging: true });
    });
    socket.on("callAccepted", (participants: Participants) => {
      if (peer && participants.signal) {
        peer.signal(participants.signal);
      }
      setOngoingCall((prev) => prev ? { ...prev, isRinging: false } : null);
      router.push(`/call/${participants.callId}`);
    });
    socket.on("callDeclined", () => {
      toast.error("Call was declined.");
      endCall();
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("getUsers");
      socket.off("receiveMessage");
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callDeclined");
    };
  }, [socket, user, peer, endCall, router]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        messages,
        sendMessage,
        ongoingCall,
        handleCall,
        handleAnswer,
        handleDecline,
        myStream,
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
  if (!context) throw new Error("useSocket must be used within SocketContextProvider");
  return context;
};
