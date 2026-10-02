#!/bin/bash
set -e
echo ""
echo "Installing MP Video Assistant... (about a minute)"

arch="$(uname -m)"
dir="$HOME/Library/Application Support/MPVideoAssistant"
exe="$dir/MPVideoAssistant"
label="nz.takeadayoff.mpva"
plist="$HOME/Library/LaunchAgents/$label.plist"
url="http://127.0.0.1:1780"

running() { curl -fs -m 3 "$url/api/remote/ping" >/dev/null 2>&1; }

launchctl bootout "gui/$(id -u)/$label" >/dev/null 2>&1 || true
pid="$(lsof -ti tcp:1780 -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "$pid" ]; then kill $pid 2>/dev/null || true; sleep 2; fi

tmp="$(mktemp -d)"
echo "- Downloading"
if ! curl -fL# "https://takeadayoff.co.nz/download/app-mac-$arch.zip?k=__CLIP_KEY__" -o "$tmp/app.zip"; then
  echo "This Mac ($arch) is not supported yet. Please send us a screenshot of this window."
  exit 1
fi
echo "- Unpacking"
ditto -x -k "$tmp/app.zip" "$tmp"
mkdir -p "$dir"
# Replace only the program; keep data, downloaded tools and models from earlier installs.
rm -rf "$dir/_internal" "$exe"
ditto "$tmp/app" "$dir"
rm -rf "$tmp"
xattr -dr com.apple.quarantine "$dir" 2>/dev/null || true
mkdir -p "$dir/data/mpva" "$HOME/Library/LaunchAgents"

cat > "$plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key><array><string>$exe</string></array>
  <key>WorkingDirectory</key><string>$dir</string>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$dir/data/mpva/server.log</string>
  <key>StandardErrorPath</key><string>$dir/data/mpva/server.log</string>
  <key>EnvironmentVariables</key><dict><key>PYTHONIOENCODING</key><string>utf-8</string></dict>
</dict>
</plist>
EOF

echo "- Starting"
launchctl bootstrap "gui/$(id -u)" "$plist"
for i in $(seq 1 90); do running && break; sleep 1; done
if running; then
  echo ""
  echo "Done! Opening the studio. It will start by itself from now on; you can close this window."
  open "https://takeadayoff.co.nz/studio/"
else
  echo "Could not start. Please send us a screenshot of this window."
fi
