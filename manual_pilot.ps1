# --- BAZAAR MANUAL PILOT ---
# Mission: Securely Save Identity & Fund

$GKey = Read-Host " PASTE PUBLIC KEY (Starts with G)"
$SKey = Read-Host " PASTE SECRET KEY (Starts with S)"

if ($GKey.StartsWith("G") -and $SKey.StartsWith("S")) {
    # 1. SAVE TO SAFE FILE
    "TEST_PUBLIC_KEY=$GKey`nTEST_SECRET_KEY=$SKey" | Out-File -FilePath .env.test -Encoding utf8
    Write-Host "`n IDENTITY SECURED in .env.test" -ForegroundColor Green

    # 2. FUND THE PILOT (FRIENDBOT)
    Write-Host " FUNDING ACCOUNT (Requesting 10,000 Test XLM)..." -ForegroundColor Cyan
    $Url = "https://friendbot.stellar.org/?addr=$GKey"
    try {
        $Response = Invoke-RestMethod -Uri $Url -ErrorAction Stop
        Write-Host " SUCCESS: Account Funded!" -ForegroundColor Green
        Write-Host " READY FOR DEPLOYMENT." -ForegroundColor Yellow
    } catch {
        Write-Host " FUNDING FAILED. (Check internet or try funding manually on the website)" -ForegroundColor Red
    }
} else {
    Write-Host " ERROR: Invalid Keys. Public must start with 'G', Secret with 'S'." -ForegroundColor Red
}
