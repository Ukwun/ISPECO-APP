"use client";

import Container from "./Container";
import { Video, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserButton, useAuth, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import OnlineUsers from "@/components/OnlineUsers";

const Navbar = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <div className="sticky top-0 border-b-2 border-primary bg-white z-50 w-full">
      <Container>
        <div className="flex justify-between items-center w-full">
          {/* App Logo and Navigation */}
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Video className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            <div className="text-xl font-bold">ISPECO</div>
          </div>

          {/* Right Section: Auth and Users */}
          <div className="flex items-center gap-4">
            {isSignedIn && (
              <>
                <UserButton afterSignOutUrl="/" />

                {/* Switch Account Button */}
                <SignOutButton signOutCallback={() => router.push("/")}>
                  <Button variant="ghost" className="flex items-center gap-1 text-sm">
                    <LogOut className="w-4 h-4" />
                    Switch Account
                  </Button>
                </SignOutButton>

                <div className="hidden md:flex">
                  <OnlineUsers variant="navbar" />
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
