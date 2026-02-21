@echo off
TITLE Project Bazaar - Master Node Ledger (SECURITY SCAN)
echo [SYSTEM] Accessing Master Node Ledger...
echo [DOMAIN] Neo Protocol / E-Network
echo --------------------------------------------------

:: REFINED HEADER LOGIC
echo [STATUS] RECENT HEARTBEATS AND SECURITY SCAN
echo.
echo --------------------------------------------------

:: Display the last 15 lines with Security Highlighting
powershell -command ^
"$log = if (Test-Path Scan_Logs.txt) { Get-Content Scan_Logs.txt -Tail 15 } else { return }; ^
foreach ($line in $log) { ^
    if ($line -like '*[SYSTEM]*') { Write-Host $line -ForegroundColor Cyan } ^
    elseif ($line -like '*[WARNING]*') { Write-Host $line -ForegroundColor Yellow } ^
    elseif ($line -like '*[UNAUTHORIZED]*') { Write-Host $line -ForegroundColor Red } ^
    else { Write-Host $line } ^
}"

echo --------------------------------------------------
echo.
echo [1] Open Full Ledger (Notepad)
echo [2] Clear RAM (Flush Terminal)
echo [3] Exit
set /p choice="Action required: "

if "%choice%"=="1" start notepad Scan_Logs.txt
if "%choice%"=="2" goto :eof
if "%choice%"=="3" exit