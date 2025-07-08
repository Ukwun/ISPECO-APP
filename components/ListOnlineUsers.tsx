"use client";

import { useSocket } from "@/context/SocketContext";
import { useUser } from "@clerk/nextjs";
import Avatar from "@/components/avatar";

const ListOnlineUsers = () => {
  const { user } = useUser();
  const { onlineUsers, handleCall } = useSocket();

  const otherOnlineUsers = onlineUsers?.filter(
    (onlineUser) => onlineUser.id !== user?.id
  );

  console.log("✅ Online users:", onlineUsers);

  console.log("👤 Current user:", user?.id);

  return (
    <div className="w-full border-b-primary/10 p-4">
      <h2 className="mb-2 text-lg font-semibold">Online Users</h2>
      {otherOnlineUsers && otherOnlineUsers.length > 0 ? (
        <div className="flex w-full items-center gap-4 overflow-x-auto">
          {otherOnlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.id}
              onClick={() => handleCall(onlineUser)}
              className="flex flex-shrink-0 cursor-pointer flex-col items-center gap-1"
            >
              <Avatar src={onlineUser.profile} />
              <div className="text-sm">{onlineUser.username}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No other users are currently online.</p>
      )}
    </div>
  );
};

export default ListOnlineUsers;
