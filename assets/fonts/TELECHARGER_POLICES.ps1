# Telecharger les polices Google Fonts pour M2R Wiki
# Lance ce script une seule fois depuis le dossier M2R/

$FontDir = "assets\fonts"
New-Item -ItemType Directory -Force -Path $FontDir | Out-Null

$GoogleFontsUrl = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Alegreya+SC:wght@400;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap"

Write-Host "Recuperation des URLs depuis Google Fonts..."

try {
    $headers = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" }
    $css = Invoke-WebRequest -Uri $GoogleFontsUrl -Headers $headers -UseBasicParsing
    $cssContent = $css.Content
} catch {
    Write-Host "Erreur lors de la recuperation du CSS Google Fonts : $_"
    exit 1
}

# Extraire toutes les URLs woff2
$woff2Pattern = 'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)'
$matches2 = [regex]::Matches($cssContent, $woff2Pattern)

if ($matches2.Count -eq 0) {
    Write-Host "Aucune police trouvee. Verifiez votre connexion internet."
    exit 1
}

Write-Host "$($matches2.Count) fichiers trouves."

# Mapping nom de famille vers nom de fichier
$familyPattern = '/\*\s*([^*]+)\s*\*/'
$familyMatches = [regex]::Matches($cssContent, $familyPattern)

$counter = 0
foreach ($m in $matches2) {
    $url = $m.Groups[1].Value
    # Deviner le nom depuis le contexte dans le CSS
    $fileName = "font-$counter.woff2"

    # Detecter la famille depuis l'URL
    if ($url -match "cinzel") {
        if ($cssContent -match "font-weight: 400[^}]*url\($([regex]::Escape($url))\)") { $fileName = "Cinzel-400.woff2" }
        elseif ($cssContent -match "font-weight: 600[^}]*url\($([regex]::Escape($url))\)") { $fileName = "Cinzel-600.woff2" }
        elseif ($cssContent -match "font-weight: 700[^}]*url\($([regex]::Escape($url))\)") { $fileName = "Cinzel-700.woff2" }
        else { $fileName = "Cinzel-$counter.woff2" }
    } elseif ($url -match "alegreyasc") {
        if ($cssContent -match "font-weight: 400[^}]*url\($([regex]::Escape($url))\)") { $fileName = "AlegreyaSC-400.woff2" }
        elseif ($cssContent -match "font-weight: 700[^}]*url\($([regex]::Escape($url))\)") { $fileName = "AlegreyaSC-700.woff2" }
        else { $fileName = "AlegreyaSC-$counter.woff2" }
    } elseif ($url -match "crimsonpro") {
        if ($cssContent -match "font-style: italic[^}]*url\($([regex]::Escape($url))\)") { $fileName = "CrimsonPro-Italic.woff2" }
        elseif ($cssContent -match "font-weight: 600[^}]*url\($([regex]::Escape($url))\)") { $fileName = "CrimsonPro-600.woff2" }
        else { $fileName = "CrimsonPro-400.woff2" }
    }

    $dest = Join-Path $FontDir $fileName
    if (-not (Test-Path $dest)) {
        Write-Host "Telechargement : $fileName"
        try {
            Invoke-WebRequest -Uri $url -OutFile $dest -UserAgent "Mozilla/5.0" -UseBasicParsing
        } catch {
            Write-Host "  Echec : $_"
        }
    } else {
        Write-Host "Deja present  : $fileName"
    }
    $counter++
}

Write-Host ""
Write-Host "Termine ! Verifiez le dossier $FontDir"
$files = Get-ChildItem $FontDir -Filter "*.woff2"
Write-Host "$($files.Count) fichiers woff2 presents :"
foreach ($f in $files) { Write-Host "  $($f.Name)" }
Write-Host ""
Write-Host "Rechargez index.html dans le navigateur."