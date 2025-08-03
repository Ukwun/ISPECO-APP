import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import Link from "next/link";

import { SocketContextProvider } from "@/context/SocketContext";
import Navbar from "@/components/layout/Navbar";
import Container from "@/components/layout/Container";
import CallNotification from "@/components/CallNotification";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

import "./globals.css";

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
        <body className={cn(geistSans.variable, geistMono.variable, "relative font-sans")}>
          <SocketContextProvider>
            <main className="flex flex-col min-h-screen bg-secondary">
              <Navbar />
              <Container>{children}</Container>
            </main>
            <Toaster position="top-right" richColors />
            <CallNotification />
          </SocketContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
