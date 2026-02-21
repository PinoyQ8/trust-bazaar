@echo off
TITLE Project Bazaar - Hybrid Soft_Sync v2.4
echo [SYSTEM] Initializing Hybrid Mesh...
echo [SYSTEM] Uptime Shield: 92 PERCENT
echo --------------------------------------------------

:: 1. MASTER NODE LEDGER STARTUP LOG
echo. >> Scan_Logs.txt
echo ================================================== >> Scan_Logs.txt
echo %DATE% %TIME% - [SYSTEM] Hybrid Mesh Startup Sequence >> Scan_Logs.txt

:: 2. LAUNCH HEARTBEAT (The Hard Layer)
echo [1/3] Starting Heartbeat Node (server.js)...
start /min cmd /c "node server.js"

:: 3. LAUNCH MERCHANT DASHBOARD (The Soft Layer)
echo [2/3] Starting Merchant Command Dashboard (Next.js)...
start /min cmd /c "npm run dev"

:: 4. LAUNCH MESH BRIDGE (The Entry Point)
echo [3/3] Re-establishing ngrok Tunnel...
start /min cmd /c "ngrok http 3000"

echo --------------------------------------------------
echo [SUCCESS] Hybrid Mesh is now active.
echo [ADJUDICATOR] Check Log_Viewer for pulse confirmation.
timeout /t 5