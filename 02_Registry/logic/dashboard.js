import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const REGISTRY_FILE = "J:\\Project-Bazaar\\02_Registry\\Genesis_Ledger.json";

app.get('/api/leaderboard', (req, res) => {
    try {
        if (fs.existsSync(REGISTRY_FILE)) {
            const data = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
            // Sort by Trust Score (TS) for the Council of Elders election
            const sorted = data.sort((a, b) => b.totalTS - a.totalTS);
            res.json(sorted);
        } else {
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to read Ledger" });
    }
});

app.listen(3002, () => console.log("[MESH-SCAN] Dashboard API active on Port 3002"));