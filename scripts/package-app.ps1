$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$manifestPath = Join-Path $projectRoot "public\manifest.json"
$publicPath = Join-Path $projectRoot "public"
$distPath = Join-Path $projectRoot "dist"
$configPath = Join-Path $projectRoot "src\config.ts"
$packagePath = Join-Path $distPath "teams-resource-launcher.zip"

if (-not (Test-Path -LiteralPath (Join-Path $distPath "index.html"))) {
    throw "Production output is missing. Run 'npm run build' first."
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($manifest.id -notmatch '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$') {
    throw "Set manifest.id to a new GUID before packaging."
}

if ($manifest.developer.name -match 'REPLACE-WITH' -or
    $manifest.developer.websiteUrl -match 'example\.com' -or
    $manifest.developer.privacyUrl -match 'example\.com' -or
    $manifest.developer.termsOfUseUrl -match 'example\.com') {
    throw "Set the publisher name and real website, privacy, and terms URLs in public/manifest.json."
}

$contentUrl = [Uri]$manifest.staticTabs[0].contentUrl
if ($contentUrl.Scheme -ne "https" -or $contentUrl.Host -eq "your-app-host.example.com") {
    throw "Set the hosted HTTPS app URL in public/manifest.json before packaging."
}

if ($manifest.validDomains -notcontains $contentUrl.Host) {
    throw "Add the app host '$($contentUrl.Host)' to manifest.validDomains."
}

$config = Get-Content -LiteralPath $configPath -Raw
if ($config -notmatch 'resourceUrl\s*=\s*"(?<url>[^"]+)"') {
    throw "Could not read resourceUrl from src/config.ts."
}
$resourceUrl = [Uri]$Matches.url
if ($resourceUrl.Scheme -ne "https" -or $resourceUrl.Host -match 'replace-with') {
    throw "Set a real HTTPS resource URL in src/config.ts before packaging."
}

foreach ($icon in @("color.png", "outline.png")) {
    if (-not (Test-Path -LiteralPath (Join-Path $publicPath $icon))) {
        throw "Required Teams app icon is missing: public/$icon"
    }
}

Compress-Archive -Path (Join-Path $publicPath "*") -DestinationPath $packagePath -Force
Write-Output "Created $packagePath"
