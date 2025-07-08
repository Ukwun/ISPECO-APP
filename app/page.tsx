"use client";

import dynamic from "next/dynamic";
import CallNotification from "@/components/CallNotification";
import ListOnlineUsers from "@/components/ListOnlineUsers";

// ⛔ DO NOT import VideoCall directly
// ✅ Dynamically import it with SSR disabled
const VideoCall = dynamic(() => import("@/components/Videocall"), { ssr: false });

export default function Home() {
  return (
    <div>
      <ListOnlineUsers />
      <CallNotification />
      <VideoCall />
    </div>
  );
}
