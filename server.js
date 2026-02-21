// server.js - Project Bazaar: Hybrid Security Adjudicator v2.5
const fs = require('fs');
const http = require('http');

const logFile = 'Scan_Logs.txt';
const keyFile = 'validation-key.txt';
const BRIDGE_URL = 'http://localhost:4040/api/tunnels';

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

// Initial Scan and pulse every 5 minutes
checkBridge();
setInterval(checkBridge, 300000);

console.log('Security Adjudicator: v2.5 ONLINE [Identity Validation Active]');