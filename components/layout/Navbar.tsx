"use client";

import Container from "./Container";
import { Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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
            <Button variant="default" onClick={() => Router.push("/sign-in")}>
              Sign In
            </Button>
            <Button variant="secondary" onClick={() => Router.push("/sign-up")}>
              Sign Up
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;