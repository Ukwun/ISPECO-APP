import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import UserStatus from "../components/layout/UserStatus";
import Link from "next/link";
import React, { createContext, useContext, useMemo } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vidChat",
  description: "Video Call",
};

export const SocketContext = createContext<any>(null);

export function SocketContextProvider({ children }: { children: React.ReactNode }) {
  // ...initialize your socket or state here
  const socketValue = useMemo(() => {
    // ...socket logic
    return {}; // replace with your socket value
  }, []);

  return (
    <SocketContext.Provider value={socketValue}>
      {children}
    </SocketContext.Provider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="fixed top-4 left-8 flex gap-2 z-50">
            <div className="border border-gray-300 rounded px-4 py-2 flex items-center justify-center">
              <Button variant="default" asChild className="w-full h-full p-0 bg-transparent border-none shadow-none">
                <Link href="/sign-up" className="w-full h-full flex items-center justify-center">Sign Up</Link>
              </Button>
            </div>
            <div className="border border-gray-300 rounded px-4 py-2 flex items-center justify-center">
              <Button variant="secondary" asChild className="w-full h-full p-0 bg-transparent border-none shadow-none">
                <Link href="/sign-in" className="w-full h-full flex items-center justify-center">Sign In</Link>
              </Button>
            </div>
            <UserStatus hideAuthLinks />
          </div>
          <SocketContextProvider>
            <main className="flex flex-col min-h-screen bg-secondary">
              <Navbar />
              <Container>
                {children}
              </Container>
            </main>
          </SocketContextProvider>
        </body>
      </html>
        </ClerkProvider>
      );
    }