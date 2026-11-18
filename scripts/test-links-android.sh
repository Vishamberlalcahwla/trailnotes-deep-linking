#!/usr/bin/env bash
# Open TrailNotes deep links on a connected Android device or emulator.
# Usage: ./scripts/test-links-android.sh [package] [url]
#   package defaults to app.trailnotes (bare app).
#   Use app.trailnotes.expo for the Expo Router app.
# Tip: run `adb shell am force-stop <package>` first to test cold start.
set -euo pipefail

PKG="${1:-app.trailnotes}"

open_url() {
  echo "Opening $1"
  adb shell am start -W -a android.intent.action.VIEW -d "'$1'" "$PKG"
}

if [[ $# -gt 1 ]]; then
  open_url "$2"
  exit 0
fi

for url in \
  "trailnotes://trail/42" \
  "trailnotes://trail/cedar-falls?ref=newsletter" \
  "trailnotes://settings" \
  "trailnotes://trail/%3Cscript%3E" \
  "trailnotes://does-not-exist"; do
  open_url "$url"
  read -r -p "Check the screen, then press Enter for the next link..."
done

echo
echo "App Links verification status (Android 12+):"
adb shell pm get-app-links "$PKG" || true
