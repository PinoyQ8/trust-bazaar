"use client";
import React from 'react';

// --- ADJUDICATOR CORE ---
export default function BazaarDashboard() {
  const networkTrust = 98; 
  const buffer = "45GB ACTIVE";
  const merchants = [
    { id: 1, name: "Genesis_01", category: "Node_Validator", trust: 99 },
    { id: 2, name: "Pioneer_X", category: "Merchant_Alpha", trust: 95 }
  ];

  return (
    <main className="min-h-screen bg-black text-cyan-500 font-mono p-12">
      <header className="border-b-2 border-cyan-900 pb-6 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Project Bazaar</h1>
          <p className="text-[10px] text-gray-500 mt-2">FOUNDER COMMAND // J:\DRIVE</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-green-500 animate-pulse font-bold tracking-widest">● SYSTEM PULSE: 100% GREEN</p>
          <p className="text-[10px] text-gray-600">BUFFER: {buffer}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 p-8 border border-cyan-800 bg-gray-950 rounded-sm">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4 text-center">Global Trust</h2>
          <div className="text-7xl font-black text-center text-white">{networkTrust}%</div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6">Genesis_100 Registry</h2>
          {merchants.map((m) => (
            <div key={m.id} className="p-4 border border-cyan-900 bg-gray-950 flex justify-between items-center">
              <div>
                <p className="text-white font-bold uppercase">{m.name}</p>
                <p className="text-[10px] text-gray-500">{m.category}</p>
              </div>
              <p className="text-xs text-cyan-400">{m.trust}% TRUST</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}