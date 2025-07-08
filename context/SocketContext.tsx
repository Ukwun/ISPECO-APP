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
import Peer from "simple-peer";
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
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [socket, setSocket] = useState<IOSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const currentSocketUser = onlineUsers?.find((u) => u.id === user?.id);

  const getMediaStream = useCallback(async (facemode?: string) => {
    if (localStream) return localStream;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { min: 15, ideal: 30, max: 60 },
          facingMode: videoDevices.length > 0 ? facemode : undefined,
        },
      });

      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.log("failed to get media stream", error);
      setLocalStream(null);
      return null;
    }
  }, [localStream]);

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

    const stream = await getMediaStream();
    if (!stream) return;

    try {
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
        endCall();
      });

      setPeer(newPeer);
      setMyStream(stream);
    } catch (error) {
      toast.error("Could not start call. Please ensure camera/microphone are enabled.");
      console.error("Error getting user media:", error);
    }
  }, [socket, currentSocketUser, endCall, getMediaStream]);

  const handleAnswer = useCallback(async () => {
    if (!socket || !ongoingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);

      const newPeer = new Peer({ initiator: false, trickle: false, stream });

      newPeer.on("signal", (signal) => {
        const updatedParticipants = { ...ongoingCall.participants, signal };
        socket.emit("answerCall", updatedParticipants);
      });

      newPeer.on("stream", (stream) => setRemoteStream(stream));
      newPeer.on("close", endCall);
      newPeer.on("error", (err) => {
        toast.error(`Call error: ${err.message}`);
        endCall();
      });

      newPeer.signal(ongoingCall.participants.signal);
      setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : null));
      setPeer(newPeer);
      router.push(`/call/${ongoingCall.participants.callId}`);
    } catch (error) {
      toast.error("Could not access camera/microphone.");
      console.error("Error accessing media devices:", error);
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
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket || !isLoaded || !user?.id) return;

    const socketUser = {
      id: user.id,
      username: user.username || user.firstName || "Anonymous",
      profile: user.imageUrl,
    };

    const onConnect = () => {
      console.log("🔌 Emitting addNewUser", socketUser);
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
      setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : null));
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
  }, [socket, isLoaded, user, peer, endCall, router]);

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
