$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
Write-Host ""
Write-Host "Installing MP Video Assistant... (about a minute)"

$dir = Join-Path $env:LOCALAPPDATA "MPVideoAssistant"
$exe = Join-Path $dir "MPVideoAssistant.exe"
$url = "http://127.0.0.1:1780"

function Test-Running { try { Invoke-WebRequest "$url/api/remote/ping" -UseBasicParsing -TimeoutSec 3 | Out-Null; $true } catch { $false } }

$running = (Get-NetTCPConnection -LocalPort 1780 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($running) { Stop-Process -Id $running -Force -ErrorAction SilentlyContinue; Start-Sleep 2 }

$tmp = Join-Path $env:TEMP "mpva-install"
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $tmp | Out-Null
Write-Host "- Downloading"
Invoke-WebRequest "https://takeadayoff.co.nz/download/app.zip?k=__CLIP_KEY__" -OutFile "$tmp\app.zip" -UseBasicParsing
Write-Host "- Unpacking"
Expand-Archive "$tmp\app.zip" $tmp -Force
New-Item -ItemType Directory -Force $dir | Out-Null
# Replace only the program; keep data, downloaded tools and models from earlier installs.
Remove-Item (Join-Path $dir "_internal"), $exe -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$tmp\app\*" $dir -Recurse -Force
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue

$launcher = Join-Path ([Environment]::GetFolderPath("Startup")) "MP Video Assistant.vbs"
$vbs = @"
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "$dir"
sh.Run """$exe""", 0, False
"@
[IO.File]::WriteAllText($launcher, $vbs, [Text.Encoding]::Unicode)

Write-Host "- Starting"
Start-Process wscript.exe -ArgumentList "`"$launcher`""
for ($i = 0; $i -lt 90 -and -not (Test-Running); $i++) { Start-Sleep 1 }
if (Test-Running) {
  Write-Host ""
  Write-Host "Done! Opening the studio. It will start by itself from now on; you can close this window."
  Start-Process "https://takeadayoff.co.nz/studio/?k=__CLIP_KEY__"
} else {
  Write-Host "Could not start. Please send a screenshot of this window."
}
