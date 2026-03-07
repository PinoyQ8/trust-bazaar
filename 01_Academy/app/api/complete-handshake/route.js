/* BAZAAR_APP_V1: Vercel Cloud Proxy
   Logic: Forwarding Handshake to X570 Command Center
*/
import { NextResponse } from 'next/server';

// THE LIVE TUNNEL TO YOUR X570
const X570_BRIDGE = 'https://hypercoagulable-nondistortingly-valarie.ngrok-free.dev';

export async function POST(request) {
    try {
        const body = await request.json();

        // Forward the data to your local Registry on the X570
        const response = await fetch(`${X570_BRIDGE}/sync-handshake`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        
        if (response.ok) {
            return NextResponse.json({ status: "SUCCESS", data: result }, { status: 200 });
        } else {
            return NextResponse.json({ status: "FAIL", message: result.message }, { status: 400 });
        }
    } catch (err) {
        console.error("[BAZAAR TECH ALERT] Cloud-to-Local Bridge Failure:", err.message);
        return NextResponse.json({ error: "X570 Bridge Offline" }, { status: 500 });
    }
}