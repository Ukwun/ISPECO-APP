"use client";

import React from "react";
import { useSocket } from "@/context/SocketContext";

const OnlineUsers = () => {
  const { onlineUsers, handleCall, socket } = useSocket();

  // Get current user's socket ID (if needed to exclude self)
  const mySocketId = socket?.id;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">📡 Online Users</h2>
      
      {onlineUsers?.length === 1 && <p>No other users online.</p>}

      <ul className="space-y-3">
        {onlineUsers
          ?.filter((user) => user.socketId !== mySocketId)
          .map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between border p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profile}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-500">Available to call</p>
                </div>
              </div>

              <button
                onClick={() => handleCall(user)}
                className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                📞 Call
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;
