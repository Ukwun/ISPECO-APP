'use client';

import { useRouter } from 'next/navigation';
import { Video, LogOut } from 'lucide-react';
import { UserButton, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Container from './Container';
import OnlineUsers from '@/components/OnlineUsers';

const Navbar = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <div className="sticky top-0 z-50 w-full border-b-2 border-primary bg-white">
      <Container>
        <div className="flex items-center justify-between w-full py-2">
          {/* Logo */}
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Video className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            <span className="text-xl font-bold">ISPECO</span>
          </div>

          {/* Right Section */}
          {isSignedIn && (
            <div className="flex items-center gap-4">
              {/* User Avatar & Sign Out */}
              <UserButton afterSignOutUrl="/" />

              {/* Sign Out Button (duplicate option, optional) */}
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="flex items-center gap-1 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Switch Account
              </Button>

              {/* Online Users (desktop only) */}
              <div className="hidden md:flex">
                <OnlineUsers variant="navbar" />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
