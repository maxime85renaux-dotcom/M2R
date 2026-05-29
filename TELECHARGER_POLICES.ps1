# ═══════════════════════════════════════════════════════════
#  TELECHARGER_POLICES.ps1
#  Télécharge les fichiers .woff2 dans assets/fonts/
# ═══════════════════════════════════════════════════════════

$fontDir = "assets/fonts"
New-Item -ItemType Directory -Force -Path $fontDir | Out-Null

$BASE = "https://cdn.jsdelivr.net/fontsource/fonts"

# Liste des polices
$fonts = @(
    # Cinzel
    @{ Url = "$BASE/cinzel@latest/latin-400-normal.woff2";      File = "Cinzel-400.woff2" }
    @{ Url = "$BASE/cinzel@latest/latin-600-normal.woff2";      File = "Cinzel-600.woff2" }
    @{ Url = "$BASE/cinzel@latest/latin-700-normal.woff2";      File = "Cinzel-700.woff2" }

    # Alegreya SC
    @{ Url = "$BASE/alegreya-sc@latest/latin-400-normal.woff2"; File = "AlegreyaSC-400.woff2" }
    @{ Url = "$BASE/alegreya-sc@latest/latin-700-normal.woff2"; File = "AlegreyaSC-700.woff2" }

    # Crimson Pro
    @{ Url = "$BASE/crimson-pro@latest/latin-400-normal.woff2";  File = "CrimsonPro-400.woff2" }
    @{ Url = "$BASE/crimson-pro@latest/latin-600-normal.woff2";  File = "CrimsonPro-600.woff2" }
    @{ Url = "$BASE/crimson-pro@latest/latin-400-italic.woff2";  File = "CrimsonPro-Italic.woff2" }
)

$ok = 0
$err = 0

foreach ($font in $fonts) {

    $url = $font.Url
    $output = Join-Path $fontDir $font.File

    Write-Host "Downloading $($font.File) ..." -NoNewline

    try {
        Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop
        Write-Host " OK" -ForegroundColor Green
        $ok++
    }
    catch {
        Write-Host " ERROR" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor DarkRed
        $err++
    }
}

Write-Host ""
Write-Host "Done: $ok OK, $err errors" -ForegroundColor Cyan

if ($err -gt 0) {
    Write-Host "Check URLs or network." -ForegroundColor Yellow
    exit 1
}