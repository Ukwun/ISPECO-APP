import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import UserStatus from "../components/layout/UserStatus";
import Link from "next/link";
import { Toaster } from "sonner";
import { SocketContextProvider } from "@/context/SocketContext"; // <-- Import your client provider
import CallNotification from "@/components/CallNotification";
import { cn } from "@/lib/utils";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn(geistSans.variable, geistMono.variable, 'relative font-sans')}>
          <SocketContextProvider>
            <main className="flex flex-col min-h-screen bg-secondary">
              <Navbar />
              <Container>
                {children}
              </Container>
            </main>
            <Toaster position="top-right" richColors />
            <CallNotification />
          </SocketContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}