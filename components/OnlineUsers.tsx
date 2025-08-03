'use client';

import React from 'react';
import { useSocket } from '@/context/SocketContext';

type OnlineUsersProps = {
  variant?: 'navbar' | 'default';
};

const OnlineUsers = ({ variant = 'default' }: OnlineUsersProps) => {
  const { onlineUsers, handleCall, socket } = useSocket();
  const mySocketId = socket?.id;

  const isNavbar = variant === 'navbar';

  return (
    <div
      className={
        isNavbar
          ? 'p-2 text-sm bg-transparent'
          : 'p-4 border rounded-lg bg-white shadow-sm max-w-md mx-auto'
      }
    >
      {!isNavbar && <h2 className="text-lg font-semibold mb-4">📡 Online Users</h2>}

      {onlineUsers?.length === 1 && <p>No other users online.</p>}

      <ul className="space-y-3">
        {onlineUsers
          ?.filter((user) => user.socketId !== mySocketId)
          .map((user) => (
            <li
              key={user.id}
              className={`flex items-center justify-between border p-3 rounded-lg ${
                isNavbar ? '' : 'hover:bg-gray-50 transition'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profile}
                  alt={user.username}
                  className={`rounded-full object-cover ${
                    isNavbar ? 'w-6 h-6' : 'w-10 h-10'
                  }`}
                />
                <div>
                  <p className="font-medium text-xs md:text-sm">{user.username}</p>
                  {!isNavbar && <p className="text-sm text-gray-500">Available to call</p>}
                </div>
              </div>

              <button
                onClick={() => handleCall(user)}
                className={`px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 ${
                  isNavbar ? 'text-[10px]' : ''
                }`}
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
