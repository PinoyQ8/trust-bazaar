import express from 'express'; // Modern MESH syntax
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Target: Permanent J: Drive Storage
const REGISTRY_FILE = "J:\\Project-Bazaar\\02_Registry\\Genesis_Ledger.json";

app.post('/02_Registry/sync', (req, res) => {
    console.log(`[MESH-SCAN] Incoming Handshake: ${req.body.uid}`);
    
    try {
        let ledger = [];
        if (fs.existsSync(REGISTRY_FILE)) {
            ledger = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
        }

        ledger.push({
            ...req.body,
            server_verified_at: new Date().toISOString()
        });

        fs.writeFileSync(REGISTRY_FILE, JSON.stringify(ledger, null, 4));
        res.status(200).send("SYNCED");
    } catch (error) {
        console.error("CRITICAL: J: Drive Write Failed", error);
        res.status(500).send("ERROR");
    }
});

// THIS BLOCK KEEPS THE TERMINAL OPEN
const PORT = 3001;
app.listen(PORT, () => {
    console.log("------------------------------------------");
    console.log(`[BAZAAR DAO] X570 COMMAND CENTER ACTIVE`);
    console.log(`[GATEWAY] Listening on Port: ${PORT}`);
    console.log(`[STORAGE] Target: ${REGISTRY_FILE}`);
    console.log("------------------------------------------");
    console.log("DO NOT CLOSE THIS WINDOW DURING ONBOARDING");
});