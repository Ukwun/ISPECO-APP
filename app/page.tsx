"use client";

import CallNotification from "@/components/CallNotification";
import ListOnlineUsers from "@/components/ListOnlineUsers";
import VideoCall from "@/components/Videocall";

export default function Home() {
  return (
    <div>
      <ListOnlineUsers />
      <CallNotification />
      <VideoCall />
    </div>
  );
}
