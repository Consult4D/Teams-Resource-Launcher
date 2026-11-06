$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$publicPath = Join-Path $projectRoot "public"
$distPath = Join-Path $projectRoot "dist"
$manifestPath = Join-Path $publicPath "manifest.json"
$packagePath = Join-Path $distPath "teams-resource-launcher.zip"

if (-not (Test-Path -LiteralPath (Join-Path $distPath "index.html"))) {
    throw "Production output is missing. Run 'npm run build' first."
}

$resourceUrlText = [Environment]::GetEnvironmentVariable("VITE_ENGAGE_URL")
if (-not $resourceUrlText) {
    $envFilePath = Join-Path $projectRoot ".env.local"
    if (Test-Path -LiteralPath $envFilePath) {
        foreach ($line in Get-Content -LiteralPath $envFilePath) {
            if ($line -match '^\s*VITE_ENGAGE_URL\s*=\s*(?<value>.*)\s*$') {
                $resourceUrlText = $Matches.value.Trim()
                if (($resourceUrlText.StartsWith('"') -and $resourceUrlText.EndsWith('"')) -or
                    ($resourceUrlText.StartsWith("'") -and $resourceUrlText.EndsWith("'"))) {
                    $resourceUrlText = $resourceUrlText.Substring(1, $resourceUrlText.Length - 2)
                }
            }
        }
    }
}

if (-not $resourceUrlText) {
    throw "Set VITE_ENGAGE_URL in .env.local or the environment before packaging."
}

$resourceUrl = [Uri]$resourceUrlText
if ($resourceUrl.Scheme -ne "https" -or $resourceUrl.Host -match 'replace-with') {
    throw "VITE_ENGAGE_URL must be a real HTTPS Viva Engage URL."
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

if ($manifest.validDomains -notcontains $resourceUrl.Host) {
    throw "Add the Engage host '$($resourceUrl.Host)' to manifest.validDomains."
}

foreach ($icon in @("color.png", "outline.png")) {
    if (-not (Test-Path -LiteralPath (Join-Path $publicPath $icon))) {
        throw "Required Teams app icon is missing: public/$icon"
    }
}

$stagingPath = Join-Path $distPath ("package-staging-" + [Guid]::NewGuid().ToString("N"))
try {
    New-Item -ItemType Directory -Path $stagingPath | Out-Null
    Copy-Item -LiteralPath $manifestPath -Destination (Join-Path $stagingPath "manifest.json")
    foreach ($icon in @("color.png", "outline.png")) {
        Copy-Item -LiteralPath (Join-Path $publicPath $icon) -Destination $stagingPath
    }

    Compress-Archive -Path (Join-Path $stagingPath "*") -DestinationPath $packagePath -Force
    Write-Output "Created $packagePath"
} finally {
    if (Test-Path -LiteralPath $stagingPath) {
        Remove-Item -LiteralPath $stagingPath -Recurse -Force
    }
}
