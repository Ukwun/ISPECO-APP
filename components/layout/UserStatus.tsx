'use client';

import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UserStatus({ hideAuthLinks = false }: { hideAuthLinks?: boolean }) {
  const { userId, isSignedIn } = useAuth();
  return (
    <div className="flex items-center gap-2">
      <UserButton afterSignOutUrl="/" />
      {isSignedIn ? (
        <span className="text-xs text-green-600">Logged in</span>
      ) : (
        <>
          {!hideAuthLinks && (
            <>
              <Button size="sm" variant="outline" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" variant="default" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
          <span className="text-xs text-red-500">Not logged in</span>
        </>
      )}
      {userId && <span className="text-xs text-gray-500">User: {userId}</span>}
    </div>
  );
}
