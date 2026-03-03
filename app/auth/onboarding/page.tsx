"use client";
import React from 'react';
import { usePiAuth } from "../../contexts/pi-auth-context";
import { Hexagon } from "lucide-react";
import Script from 'next/script';

export default function HomePage() {
  const { userData, authMessage, isAuthenticated } = usePiAuth();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-[#06b6d4]">
      {/* MESH FORCE: Using the Next.js Script component to avoid hydration errors */}
      <Script 
        src="https://sdk.minepi.com/pi-sdk.js" 
        strategy="beforeInteractive" 
      />

      <div className="text-center space-y-6">
        <div className="relative animate-pulse">
          <Hexagon className="h-20 w-20 text-[#06b6d4]" fill="currentColor" opacity="0.2" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Hexagon className="h-10 w-10 text-[#06b6d4]" fill="currentColor" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tighter uppercase">Project Bazaar</h1>
        
        <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 p-4 rounded-lg">
          <p className="font-mono text-sm">{authMessage}</p>
        </div>

        {isAuthenticated && userData ? (
          <div className="mt-8 p-4 border border-[#06b6d4] rounded shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <p className="text-xl font-bold">WELCOME PIONEER</p>
            <p className="text-sm">@{userData.username}</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground animate-bounce">Awaiting MESH Handshake...</p>
        )}
      </div>
    </div>
  );
}