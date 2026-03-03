"use client";

import React from 'react';
import Link from 'next/link';

export default function MainnetHome() {
  return (
    <div className="min-h-screen bg-black font-mono flex flex-col items-center justify-center p-4 border-4 border-double border-gray-900">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* LOGO SECTOR */}
        <div className="relative inline-block">
          <div className="w-16 h-16 border-2 border-cyan-600 flex items-center justify-center mx-auto mb-4 rotate-45 group-hover:rotate-90 transition-transform duration-500">
            <span className="text-cyan-600 text-2xl -rotate-45 font-bold">B</span>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-600 animate-pulse"></div>
        </div>

        {/* IDENTITY ANCHOR */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Project Bazaar <span className="text-cyan-600">Mainnet</span>
          </h1>
          <p className="text-[10px] text-gray-500 tracking-[0.5em] uppercase">
            Decentralized Autonomous Organization // Node Alpha
          </p>
        </div>

        {/* STATUS LEDGER */}
        <div className="border border-gray-800 p-6 bg-gray-950/50 backdrop-blur-sm">
          <div className="flex justify-between text-[10px] mb-4 border-b border-gray-900 pb-2">
            <span className="text-gray-500 uppercase">System Status:</span>
            <span className="text-green-500 font-bold uppercase">100% Green / Sovereign</span>
          </div>
          
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Establishing the MESH Protocol for Real Pioneers. This node is hard-coded for secure commerce 
            within the Pi Network Ecosystem. 47dec Validation Key Engaged.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/admin" 
              className="border border-cyan-900 p-3 text-[10px] text-cyan-600 hover:bg-cyan-900 hover:text-white transition-all uppercase font-bold"
            >
              Access Ledger
            </Link>
            <div className="border border-gray-800 p-3 text-[10px] text-gray-600 uppercase flex items-center justify-center">
              March 12 Ignition
            </div>
          </div>
        </div>

        {/* FOOTER METADATA */}
        <div className="pt-8">
          <p className="text-[8px] text-gray-700 uppercase tracking-widest">
            X570 Taichi Workstation // C: Drive Freedom Verified
          </p>
        </div>
      </div>
    </div>
  );
}