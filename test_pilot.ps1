# --- BAZAAR TEST PILOT (v1.0) ---
Write-Host "  PREPARING TEST FLIGHT..." -ForegroundColor Cyan

# 1. GENERATE BURNER KEYS
# (Using Stellar's Lab logic locally for safety)
$KeyPair = docker exec stellar /usr/local/bin/stellar-core gen-seed
$Secret = $KeyPair | Select-String "Secret seed:"
$Public = $KeyPair | Select-String "Public:"

$SKey = $Secret.ToString().Split(":")[-1].Trim()
$GKey = $Public.ToString().Split(":")[-1].Trim()

Write-Host "`n BURNER IDENTITY GENERATED" -ForegroundColor Yellow
Write-Host "   Public (G): $GKey" -ForegroundColor Gray
Write-Host "   Secret (S): ******************** (Saved to .env.test)" -ForegroundColor Gray

# 2. SAVE TO SAFE FILE
"TEST_PUBLIC_KEY=$GKey`nTEST_SECRET_KEY=$SKey" | Out-File -FilePath .env.test -Encoding utf8

# 3. FUND THE PILOT (FRIENDBOT)
Write-Host "`n FUNDING ACCOUNT (Requesting Testnet Credits)..." -ForegroundColor Cyan
$Url = "https://friendbot.stellar.org/?addr=$GKey"
try {
    $Response = Invoke-RestMethod -Uri $Url -ErrorAction Stop
    Write-Host " SUCCESS: Account Funded!" -ForegroundColor Green
    Write-Host "   Ready to Deploy Hash: 5FD5EE..." -ForegroundColor White
} catch {
    Write-Host " FUNDING FAILED. (Is the internet active?)" -ForegroundColor Red
}
