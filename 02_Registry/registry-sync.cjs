const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// --- SHIELDING: GLOBAL ACCESS ---
// Note: You can replace '*' with your Vercel URL later for tighter security
app.use(cors({ origin: '*' })); 
app.use(bodyParser.json());

// --- DATA VAULT PATHS ---
const ledgerPath = 'J:/Project-Bazaar/02_Registry/Genesis_Ledger.json';
const inventoryPath = 'J:/Project-Bazaar/02_Registry/Merchant_Inventory.json';
const transactionPath = 'J:/Project-Bazaar/02_Registry/Transactions.json';

// --- HELPER: RECORD TRANSACTION ---
const logTransaction = (type, user, details, amount) => {
    try {
        let logs = [];
        if (fs.existsSync(transactionPath)) {
            logs = JSON.parse(fs.readFileSync(transactionPath, 'utf8'));
        }
        const newEntry = {
            timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuwait' }),
            type: type,
            pioneer: user,
            details: details,
            amount_bzr: amount
        };
        logs.unshift(newEntry); // Adds latest to the top
        fs.writeFileSync(transactionPath, JSON.stringify(logs.slice(0, 50), null, 4)); // Keep last 50
    } catch (err) { console.error("Logging Error:", err); }
};

// --- ROUTE 1: FETCH PIONEER LEDGER ---
app.get('/get-ledger', (req, res) => {
    try {
        const data = fs.readFileSync(ledgerPath, 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "Ledger Vault Offline" });
    }
});

// --- ROUTE 2: FETCH MERCHANT INVENTORY ---
app.get('/get-inventory', (req, res) => {
    try {
        const data = fs.readFileSync(inventoryPath, 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "Inventory Vault Offline" });
    }
});

// --- ROUTE 3: FETCH LIVE TRANSACTION LOG ---
app.get('/get-transactions', (req, res) => {
    try {
        if (!fs.existsSync(transactionPath)) return res.status(200).json([]);
        const data = fs.readFileSync(transactionPath, 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "History Vault Offline" });
    }
});

// --- ROUTE 4: CLAIM GENESIS WAGE (0.45 BZR) ---
app.post('/claim-wage', (req, res) => {
    const { username } = req.body;
    try {
        let ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        const target = ledger.find(p => p.pioneer === username);
        if (target) {
            const wage = 0.45;
            target.wallet_balances.simulated_bzr = (parseFloat(target.wallet_balances.simulated_bzr) + wage).toFixed(2);
            fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 4));
            
            // Record to History
            logTransaction("WAGE_CLAIM", username, "Daily Genesis Dividend", `+${wage}`);
            
            res.status(200).json({ status: "SUCCESS", new_balance: target.wallet_balances.simulated_bzr });
        } else { res.status(404).json({ error: "Pioneer Not Found" }); }
    } catch (err) { res.status(500).json({ error: "Registry Update Failed" }); }
});

// --- ROUTE 5: MERCHANT PAYMENT (1:10 PEG LOGIC) ---
app.post('/merchant-payment', (req, res) => {
    const { username, amount_php, item_name } = req.body;
    try {
        let ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        const target = ledger.find(p => p.pioneer === username);
        const bzrCost = (amount_php / 10); // THE HOLY 1:10 PEG

        if (target && parseFloat(target.wallet_balances.simulated_bzr) >= bzrCost) {
            target.wallet_balances.simulated_bzr = (parseFloat(target.wallet_balances.simulated_bzr) - bzrCost).toFixed(2);
            fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 4));
            
            // Record to History
            logTransaction("PURCHASE", username, `Bought ${item_name || 'Market Item'}`, `-${bzrCost.toFixed(2)}`);
            
            res.status(200).json({ status: "SUCCESS", new_balance: target.wallet_balances.simulated_bzr });
        } else {
            res.status(400).json({ error: "Insufficient BZR Balance" });
        }
    } catch (err) { res.status(500).json({ error: "Payment Processing Failed" }); }
});

// --- ROUTE 6: GENESIS HANDSHAKE SYNC (FROM VERCEL) ---
app.post('/sync-handshake', (req, res) => {
    const { username, txid } = req.body;
    try {
        console.log(`[INCOMING HANDSHAKE] Pioneer: ${username} | TXID: ${txid}`);
        
        let ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        
        // Find the pioneer in the ledger array
        const target = ledger.find(p => p.pioneer === username);

        if (target) {
            // Initialize handshake array if it doesn't exist in the JSON object
            if (!target.handshakes) target.handshakes = [];

            // Prevent double-entry
            if (!target.handshakes.find(h => h.txid === txid)) {
                target.handshakes.push({
                    txid: txid,
                    timestamp: new Date().toISOString(),
                    status: "VERIFIED"
                });

                fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 4));
                
                // Record to the Global History Log
                logTransaction("HANDSHAKE", username, "Genesis Proof-of-Work", "SIGNATURE");

                console.log(`[SUCCESS] Handshake Pinned to J: Drive for ${username}`);
                res.status(200).json({ status: "SUCCESS" });
            } else {
                res.status(400).json({ error: "Handshake already recorded." });
            }
        } else {
            res.status(404).json({ error: "Pioneer not in Registry." });
        }
    } catch (err) {
        console.error("Vault Write Error:", err.message);
        res.status(500).json({ error: "MESH Write Failure" });
    }
});

// --- IGNITION ---
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log("------------------------------------------");
    console.log("[BAZAAR DAO] MAINNET ENGINE ONLINE");
    console.log(`PORT: ${PORT} | KUWAIT TIME: ${new Date().toLocaleTimeString()}`);
    console.log(`TUNNEL: https://hypercoagulable-nondistortingly-valarie.ngrok-free.dev`);
    console.log("------------------------------------------");
});