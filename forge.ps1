# --- BAZAAR FORGE V3 (SAFE MODE) ---
Write-Host " IGNITING FORGE V3 (Targeting Trust Logic)..." -ForegroundColor Yellow

# 1. BUILD (Pointing to the subfolder)
cargo build --manifest-path ".\trust_logic\Cargo.toml" --target wasm32-unknown-unknown --release

# 2. LOCATE (Looking inside the subfolder's target)
$WasmFile = Get-ChildItem -Path ".\trust_logic\target\wasm32-unknown-unknown\release\*.wasm" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($WasmFile) {
    $Hash = Get-FileHash $WasmFile.FullName -Algorithm SHA256
    Write-Host "`n SUCCESS: Binary Forged!" -ForegroundColor Green
    Write-Host " File: $($WasmFile.Name)" -ForegroundColor White
    Write-Host " Hash: $($Hash.Hash)" -ForegroundColor Yellow
} else {
    Write-Host "`n FAILED. Could not find the WASM file." -ForegroundColor Red
}
