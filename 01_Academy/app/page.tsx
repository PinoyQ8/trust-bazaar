'use client';
import { useEffect, useState } from 'react';

export default function BazaarAcademyTerminal() {
  const [sdkReady, setSdkReady] = useState(false);
  const [isStriking, setIsStriking] = useState(false);

  useEffect(() => {
    const piSDK = (window as any).Pi;
    if (piSDK) {
      piSDK.init({ version: '2.0', sandbox: true });
      setSdkReady(true);
    }
  }, []);

  const triggerStep10 = async () => {
    const piSDK = (window as any).Pi;
    if (!piSDK || !sdkReady) return;
    setIsStriking(true);

    try {
      await piSDK.authenticate(['payments'], async (payment: any) => {});
      
      piSDK.createPayment({
        amount: 1,
        memo: 'BZR-ACADEMY: Phase 10 Handshake',
        metadata: { step: 10 }
      }, {
        onReadyForServerApproval: async (paymentId: string) => { 
          await fetch('/api/complete-handshake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve', paymentId })
          });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => { 
          await fetch('/api/complete-handshake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'complete', paymentId, txid })
          });
          setIsStriking(false);
          alert('SUCCESS: Handshake Confirmed. TXID: ' + txid);
        },
        onCancel: () => setIsStriking(false),
        onError: (error: any) => { setIsStriking(false); alert(error.message); }
      });
    } catch (err: any) { setIsStriking(false); }
  };

  return (
    <div style={{ backgroundColor: '#050505', color: '#00ff41', fontFamily: 'monospace', minHeight: '100vh', padding: '20px' }}>
      <div style={{ border: '1px solid #00ff41', maxWidth: '600px', margin: '40px auto', padding: '20px', boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}>
        <h1 style={{ textAlign: 'center' }}>[BAZAAR ACADEMY]</h1>
        <p style={{ textAlign: 'center', fontSize: '0.8rem' }}>Status: <span style={{ color: '#FFD700' }}>ONLINE // VERCEL NODE</span></p>
        
        <div style={{ border: '1px dashed #00ff41', padding: '15px', marginTop: '20px' }}>
          <p> [GENESIS STRIKE] PHASE 10</p>
          <button 
            onClick={triggerStep10}
            disabled={!sdkReady || isStriking}
            style={{ 
              width: '100%', backgroundColor: '#00ff41', color: '#000', 
              padding: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer' 
            }}
          >
            {isStriking ? 'TRANSMITTING...' : (sdkReady ? 'EXECUTE STEP #10' : 'LOADING SDK...')}
          </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '0.7rem', color: '#555' }}>
          // HEARTBEAT: [March 14 // 17:50 AST] - ngrok de-linked.
        </div>
      </div>
    </div>
  );
}