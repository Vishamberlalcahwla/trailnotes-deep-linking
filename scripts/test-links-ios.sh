#!/usr/bin/env bash
# Open TrailNotes deep links in the booted iOS Simulator.
# Usage: ./scripts/test-links-ios.sh [url]
# Tip: also run this after force-quitting the app to test cold start.
set -euo pipefail

if [[ $# -gt 0 ]]; then
  xcrun simctl openurl booted "$1"
  exit 0
fi

for url in \
  "trailnotes://trail/42" \
  "trailnotes://trail/cedar-falls?ref=newsletter" \
  "trailnotes://settings" \
  "trailnotes://trail/%3Cscript%3E" \
  "trailnotes://does-not-exist"; do
  echo "Opening $url"
  xcrun simctl openurl booted "$url"
  read -r -p "Check the screen, then press Enter for the next link..."
done
