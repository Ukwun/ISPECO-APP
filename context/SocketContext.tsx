"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { io, Socket as IOSocket } from "socket.io-client";
import Peer, { SignalData } from "simple-peer";
import { toast } from "sonner";
import { OngoingCall, Participants, SocketUser } from "@/types";

interface ISocketContext {
  socket: IOSocket | null;
  onlineUsers: SocketUser[] | null;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  ongoingCall: OngoingCall | null;
  localStream: MediaStream | null;
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

export const SocketContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const router = useRouter();
  const [socket, setSocket] = useState<IOSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
    ],
  };

  const currentSocketUser = onlineUsers?.find((u) => u.id === user?.id);

  const getMediaStream = useCallback(async () => {
    if (localStream) return localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      toast.error("Could not access camera or microphone.");
      return null;
    }
  }, [localStream]);

  const endCall = useCallback(() => {
    myStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    peer?.destroy();
    setPeer(null);
    setMyStream(null);
    setRemoteStream(null);
    setOngoingCall(null);
    setLocalStream(null);
  }, [myStream, remoteStream, peer]);

  const handleCall = useCallback(async (receiver: SocketUser) => {
    if (!currentSocketUser || !socket) return;

    const stream = await getMediaStream();
    if (!stream) return;
    setMyStream(stream);

    const callId = crypto.randomUUID();
    const newPeer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: ICE_SERVERS,
    });

    newPeer.on("signal", (signal) => {
      const participants: Participants = { callId, caller: currentSocketUser, receiver, signal };
      socket.emit("call", participants);
      setOngoingCall({ participants, isRinging: false });
    });

    newPeer.on("stream", setRemoteStream);
    newPeer.on("close", endCall);
    newPeer.on("error", (err) => {
      toast.error(`Call failed: ${err.message}`);
      endCall();
    });

    setPeer(newPeer);
  }, [socket, currentSocketUser, getMediaStream, endCall]);

  const handleAnswer = useCallback(async () => {
    if (!socket || !ongoingCall) return;

    const stream = await getMediaStream();
    if (!stream) return;
    setMyStream(stream);

    const newPeer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: ICE_SERVERS,
    });

    newPeer.on("signal", (signal) => {
      const updated = { ...ongoingCall.participants, signal };
      socket.emit("answerCall", updated);
    });

    newPeer.on("stream", setRemoteStream);
    newPeer.on("close", endCall);
    newPeer.on("error", (err) => {
      toast.error(`Call error: ${err.message}`);
      endCall();
    });

    newPeer.signal(ongoingCall.participants.signal);
    setOngoingCall((prev) => prev ? { ...prev, isRinging: false } : null);
    setPeer(newPeer);
    router.push(`/call/${ongoingCall.participants.callId}`);
  }, [socket, ongoingCall, getMediaStream, endCall, router]);

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
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const socketUser = {
      id: user.id,
      username: user.username || user.firstName || "Anonymous",
      profile: user.imageUrl,
    };

    const onConnect = () => {
      socket.emit("addNewUser", socketUser);
    };

    if (socket.connected) onConnect();
    socket.on("connect", onConnect);
    socket.on("getUsers", (users: SocketUser[]) => setOnlineUsers(users));
    socket.on("receiveMessage", (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on("incomingCall", (participants: Participants) => {
      setOngoingCall({ participants, isRinging: true });
    });
    socket.on("callAccepted", (participants: Participants) => {
      if (peer && participants.signal) peer.signal(participants.signal);
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
        localStream,
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
