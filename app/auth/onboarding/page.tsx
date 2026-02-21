'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. ESTABLISH MESH SYNC ON MOUNT
  useEffect(() => {
  const establishSync = async () => {
    try {
      // Force a simple request to bypass complex CORS checks
      const res = await fetch('/api/v23/sync', {
        method: 'GET',
        mode: 'cors', // Explicitly set CORS mode
        cache: 'no-cache'
      });
      if (res.ok) console.log("MESH-SCAN: S23 SYNC ACTIVE");
    } catch (err) {
      console.error("SYNC_STALL: Potential Tunnel Block");
    }
  };
  establishSync();
}, []);

  // 2. PI LOGIN HANDLER (Standard Protocol)
  const handlePiLogin = () => {
    setLoading(true);
    // Placeholder for Pi SDK integration
    setTimeout(() => setLoading(false), 2000);
  };

  // 3. ADMIN OVERRIDE (Identity Hash Protocol)
  const handleAdminLogin = () => {
    sessionStorage.setItem('x-pioneer-key', adminKey);
    router.push('/admin');
  };

  // 4. THE UNIFIED UI (Single Return)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 font-mono">
      <h1 className="text-4xl font-bold mb-4 tracking-tighter text-cyan-500">PROJECT BAZAAR</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md text-sm border-l border-yellow-500 pl-4">
        NODE: X570-TAICHI | STATUS: ACTIVE <br/>
        Please verify identity via Pi Network MESH.
      </p>

      {!showAdminInput ? (
        <button
          onClick={handlePiLogin}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-sm transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]"
        >
          {loading ? 'VERIFYING...' : 'LOGIN WITH PI NETWORK'}
        </button>
      ) : (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <input 
            type="password" 
            placeholder="ENTER IDENTITY HASH"
            className="bg-gray-900 border border-gray-700 p-2 text-center text-yellow-500 focus:outline-none focus:border-yellow-500"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <button onClick={handleAdminLogin} className="text-xs bg-gray-800 p-2 hover:bg-gray-700 uppercase transition-colors">
            Execute Override
          </button>
        </div>
      )}

      {/* HIDDEN ADMIN TRIGGER */}
      <div 
        onClick={() => setShowAdminInput(!showAdminInput)}
        className="mt-12 text-[10px] text-gray-800 hover:text-gray-600 cursor-pointer uppercase tracking-widest transition-colors"
      >
        Neo Protocol | v23.2 Secured Node
      </div>
    </div>
  );
}