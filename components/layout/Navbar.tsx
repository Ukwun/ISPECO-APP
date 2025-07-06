"use client";

import Container from "./Container";
import { Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "@/context/SocketContext";

type SocketUser = {
  id: string;
  username: string;
  profileImageUrl: string;
};

export const OnlineUsers = () => {
  const socketContext = useContext(SocketContext);
  const socket = socketContext?.socket;
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);

  useEffect(() => {
    if (!socket) return;
    const handleGetUsers = (users: SocketUser[]) => setOnlineUsers(users);
    socket.on("getUsers", handleGetUsers);
    return () => socket.off("getUsers", handleGetUsers);
  }, [socket]);

  if (!onlineUsers.length) return null;

  return (
    <div className="flex gap-2 items-center ml-4">
      <span className="text-xs text-gray-500">Online:</span>
      {onlineUsers.map((user) => (
        <span key={user.id} title={user.username}>
          <img
            src={user.profileImageUrl}
            alt={user.username}
            width={24}
            height={24}
            style={{ borderRadius: "50%", display: "inline-block", marginRight: 4 }}
          />
        </span>
      ))}
    </div>
  );
};

const Navbar = () => {
  const Router = useRouter();
  const { isSignedIn } = useAuth();
  return (
    <div className="sticky top-0 border-b-2 border-primary bg-white z-50 w-full">
      <Container>
        <div className="flex justify-between items-center w-full">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => Router.push("/")}
          >
            <Video className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            <div className="text-xl font-bold">ISPECO</div>
          </div>
          <div className="flex gap-6 items-center">
            <Link href="/sign-in">
              <Button variant="default">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="secondary">Sign Up</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
            <OnlineUsers />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;