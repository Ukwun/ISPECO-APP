'use client';

import React from 'react';

const OnlineUsers: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-64">
      <h2 className="text-xl font-semibold mb-4">Online Users</h2>
      <ul>
        <li>User 1</li>
        <li>User 2</li>
        <li>User 3</li>
      </ul>
    </div>
  );
};

export default function ChatPage() {
  return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <main className="p-8">
          <h1 className="text-3xl font-bold text-secondary-foreground mb-8">
            Real-Time Dashboard
          </h1>
          <div className="flex gap-8">
            <div className="flex-grow bg-white p-6 rounded-lg shadow-md w-96">
              <h2 className="text-xl font-semibold mb-4">Main Content</h2>
              <p>Your main application content can go here.</p>
            </div>
            <OnlineUsers />
          </div>
        </main>
      </div>
  );
}