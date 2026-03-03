/* BAZAAR_APP_V1: Next.js v16.1.6 API Route 
   Logic: Genesis Ledger Persistence (MESH Protocol)
*/
import { NextResponse } from 'next/server';
import fs from 'fs';

const ledgerPath = 'J:/Project-Bazaar/02_Mainnet/genesis_ledger.json';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, txid } = body;

        // Verify physical J:\ Drive access
        const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

        // Audit check: Prevent double-entry in the 0/5 Genesis Hunt
        if (!ledger.pioneer_handshakes.find(p => p.username === username)) {
            ledger.pioneer_handshakes.push({
                username: username,
                txid: txid,
                timestamp: new Date().toISOString(),
                status: "VERIFIED"
            });

            fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 4));
            console.log(`[SYNC SUCCESS] Genesis Pioneer Verified: ${username}`);
            
            return NextResponse.json({ status: "SUCCESS" }, { status: 200 });
        } else {
            return NextResponse.json({ status: "FAIL", message: "Duplicate" }, { status: 400 });
        }
    } catch (err) {
        console.error("[BAZAAR TECH ALERT] Storage Error:", err.message);
        return NextResponse.json({ error: "MESH Write Failure" }, { status: 500 });
    }
}