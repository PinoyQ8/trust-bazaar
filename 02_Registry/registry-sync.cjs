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

// --- ROUTE 7: TRUST COMMODITY & 1-STRIKE PURGE ---
app.post('/update-trust', (req, res) => {
    const { username, penalty_points, is_strike } = req.body;
    try {
        let ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        const target = ledger.find(p => p.pioneer === username);

        if (target) {
            // 1. Initialize Trust Data if missing (Backward Compatibility)
            if (target.trust_score === undefined) target.trust_score = 100;
            if (!target.status) target.status = "Verified";

            // 2. The Justice Matrix Logic
            if (is_strike || (target.trust_score - penalty_points) <= 74) {
                // EXECUTING 1-STRIKE PURGE (Exile Threshold Breached)
                target.trust_score = 0;
                target.status = "Exiled";
                target.wallet_balances.simulated_bzr = "0.00"; // Confiscate Funds to Treasury
                
                logTransaction("PURGE_PROTOCOL", username, "1-Strike Exile Executed. Funds Forfeited.", "-ALL");
                fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 4));
                
                console.log(`[JUSTICE] Pioneer ${username} EXILED.`);
                return res.status(200).json({ status: "EXILED", new_ts: 0 });
            } else {
                // APPLYING OPERATIONAL FRICTION (TS Bleed)
                target.trust_score -= penalty_points;
                target.status = target.trust_score <= 89 ? "Warning" : "Verified";
                
                logTransaction("TRUST_PENALTY", username, `SLA Breach: -${penalty_points} TS`, "0.00");
                fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 4));
                
                console.log(`[JUSTICE] Pioneer ${username} penalized. New TS: ${target.trust_score}`);
                return res.status(200).json({ status: "UPDATED", new_ts: target.trust_score });
            }
        } else {
            res.status(404).json({ error: "Pioneer Not Found in Registry" });
        }
    } catch (err) { 
        console.error("Justice Engine Error:", err);
        res.status(500).json({ error: "Justice Matrix Failed" }); 
    }
});

// --- ROUTE 8: THE NUCLEAR OPTION (LOCAL FLUSH) ---
app.post('/admin-flush', (req, res) => {
    const adminKey = req.headers['x-admin-auth'];
    
    // Safety check: Must match your secret key
    if (adminKey === "YOUR_SECRET_MASTER_KEY") {
        const logPath = 'J:/Project-Bazaar/02_Registry/Scan_Logs.txt';
        const ledgerPath = 'J:/Project-Bazaar/02_Registry/Genesis_Ledger.json';

        // Wipe the logs and reset the ledger
        fs.writeFileSync(logPath, `[SYSTEM] LEDGER FLUSHED - KUWAIT TIME: ${new Date().toLocaleString()}\n`);
        fs.writeFileSync(ledgerPath, JSON.stringify([], null, 4));

        console.log("!!! ATTENTION: SYSTEM PURGE EXECUTED VIA S23 REMOTE !!!");
        res.json({ status: "SUCCESS", message: "J: Drive Cleared" });
    } else {
        res.status(403).json({ error: "Unauthorized" });
    }
});

// --- ROUTE 9: MINT RWA INVENTORY (ADD ASSET) ---
app.post('/add-inventory', (req, res) => {
    const { merchant, item_name, price_php } = req.body;
    try {
        // Path to your Inventory Vault
        const inventoryPath = 'J:/Project-Bazaar/02_Registry/Merchant_Inventory.json';
        
        // 1. Load existing inventory
        let inventory = [];
        if (fs.existsSync(inventoryPath)) {
            inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
        }

        // 2. Create the New RWA Asset
        const newItem = {
            item_id: "BZR-RWA-" + Date.now(), // Unique Timestamp ID
            merchant: merchant,
            item_name: item_name,
            price_php: parseFloat(price_php),
            price_bzr: (price_php / 10).toFixed(2), // ENFORCING THE HOLY PEG
            status: "Available",
            timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuwait' })
        };

        // 3. Save to J: Drive
        inventory.push(newItem);
        fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 4));

        // 4. Log the Minting in Global History
        logTransaction("ASSET_MINT", merchant, `Minted: ${item_name}`, "REGISTRY");

        console.log(`[SUCCESS] RWA Minted: ${item_name} for ${merchant}`);
        res.status(200).json({ status: "SUCCESS" });

    } catch (err) {
        console.error("Inventory Write Error:", err);
        res.status(500).json({ error: "Vault Write Failure" });
    }
});

// --- ROUTE 10: TOKENOMIC SIMULATION (MINT/BURN) ---
app.post('/simulate-trade', (req, res) => {
    const { buyer, merchant, amount_php } = req.body;
    try {
        let ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        const bzr_value = amount_php / 10; // The Holy Peg
        const tax = bzr_value * 0.10;      // 10% DAO Tax
        const net_payout = bzr_value - tax;

        // 1. Deduct from Buyer
        const buyerIdx = ledger.findIndex(p => p.pioneer === buyer);
        if(ledger[buyerIdx].bzr_balance < bzr_value) return res.status(400).json({error: "Insufficent BZR"});
        ledger[buyerIdx].bzr_balance -= bzr_value;

        // 2. Pay Merchant (Minus Tax)
        const merchantIdx = ledger.findIndex(p => p.pioneer === merchant);
        ledger[merchantIdx].bzr_balance += net_payout;

        // 3. Update J: Drive
        fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 4));
        
        // 4. Log the Economic Event
        logTransaction("TRADE_SIM", buyer, `Bought RWA from ${merchant} (-${bzr_value} BZR)`, "ECONOMY");
        
        res.status(200).json({ 
            status: "SUCCESS", 
            tax_collected: tax,
            merchant_payout: net_payout 
        });
    } catch (err) { res.status(500).json({ error: "Economic Engine Failure" }); }
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