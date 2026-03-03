"use client";
import React from 'react';

interface MerchantProps {
  name: string;
  role: string;
  trust: number;
  utility: string;
  location: string;
}

export default function MerchantCard({ name, role, trust, utility, location }: MerchantProps) {
  return (
    <div className="p-4 border-l-4 border-cyan-600 bg-gray-900 mb-4 hover:bg-gray-800 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <p className="text-[10px] text-cyan-500 uppercase tracking-widest">{role} // {location}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">TRUST</span>
          <div className="text-xl font-black">{trust}%</div>
        </div>
      </div>
      <div className="mt-3 py-1 px-2 bg-black border border-gray-800 inline-block rounded-sm">
        <p className="text-[10px] text-green-400 font-mono">UTILITY: {utility}</p>
      </div>
    </div>
  );
}