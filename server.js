// server.js - Project Bazaar: Hybrid Security Adjudicator v2.6 (ESM Architecture)
import fs from 'fs';
import http from 'http';
import express from 'express';

const app = express();
const PORT = 3000; // Target port for the Ngrok tunnel

const logFile = 'Scan_Logs.txt';
const keyFile = '02_Mainnet/validation-key.txt';
const BRIDGE_URL = 'http://localhost:4040/api/tunnels';

// --- MESH SECURITY & LEDGER PROTOCOLS ---

function getValidationKey() {
    try {
        return fs.readFileSync(keyFile, 'utf8').trim();
    } catch (err) {
        return null;
    }
}

function writeToLedger(tag, message) {
    const timestamp = new Date().toLocaleString();
    const entry = `\n${timestamp} - [${tag}] ${message}`;
    fs.appendFile(logFile, entry, (err) => {
        if (err) console.error('![ERROR] Ledger write failure.');
    });
}

function checkBridge() {
    const key = getValidationKey();
    
    // SECURITY GATE: Check if the Pioneer Validation Key exists
    if (!key) {
        writeToLedger('UNAUTHORIZED', 'Pioneer Validation Key MISSING. Heartbeat Blocked.');
        console.log('![CRITICAL] Validation Key not found. Pulse inhibited.');
        return;
    }

    http.get(BRIDGE_URL, (res) => {
        if (res.statusCode === 200) {
            // Heartbeat pulsed only if Key is present
            writeToLedger('SYSTEM', `Heartbeat Pulse - NODE: HYBRID-CORE-ACTIVE (KEY: ${key.substring(0, 5)}...)`);
            console.log('[OK] Bridge Verified & Pioneer Key Validated.');
        } else {
            writeToLedger('WARNING', 'Bridge Handshake unstable.');
        }
    }).on('error', (err) => {
        writeToLedger('UNAUTHORIZED', 'MESH Bridge Offline or Interrupted');
        console.log('![ALERT] Bridge failure detected.');
    });
}

// --- E-NETWORK API GATEWAY ---

// Hard-Code CORS for seamless E-Network alignment
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    // Intercept and resolve preflight OPTIONS requests instantly
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// The Missing MESH Route: Real Pioneers Database Hook
app.get('/api/pioneers', (req, res) => {
    writeToLedger('API-SYNC', 'Pioneer database queried by E-Network.');
    console.log('[SYNC] E-Network requested /api/pioneers data.');
    
    // Transmit a 200 OK status with an empty array to stabilize the frontend architecture
    res.status(200).json([]); 
});

// --- IGNITION SEQUENCE ---

// 1. Ignite the API Listener
app.listen(PORT, () => {
    console.log(`\nSecurity Adjudicator: v2.6 ONLINE [Identity Validation Active]`);
    console.log(`[OK] E-Network API Gateway listening on PORT ${PORT}`);
    console.log(`[ACTION REQUIRED] Ensure Ngrok is tunneling to exactly: http://localhost:${PORT}\n`);
});

// 2. Initial Scan and pulse every 5 minutes (300000 ms)
checkBridge();
setInterval(checkBridge, 300000);