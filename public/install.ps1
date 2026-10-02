$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
Write-Host ""
Write-Host "Installing MP Video Assistant... (first time takes a few minutes)"
$dir = Join-Path $env:LOCALAPPDATA "MPVideoAssistant"
$tmp = Join-Path $env:TEMP "mpva-install"
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $tmp | Out-Null
Invoke-WebRequest "https://takeadayoff.co.nz/download/app.zip?k=__CLIP_KEY__" -OutFile "$tmp\app.zip" -UseBasicParsing
Expand-Archive "$tmp\app.zip" $tmp -Force
New-Item -ItemType Directory -Force $dir | Out-Null
Copy-Item "$tmp\MP-Video-Assistant\*" $dir -Recurse -Force
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
& powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\setup.ps1" -Restart
if ($LASTEXITCODE -ne 0) { Write-Host "Something went wrong. Please send a screenshot of this window." }
