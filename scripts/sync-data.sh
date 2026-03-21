#!/bin/bash
# Sync regime and addon JSON data from the GOBL repository
# Usage: bash scripts/sync-data.sh [path-to-gobl-repo]

GOBL_REPO="${1:-../gobl}"

if [ ! -d "$GOBL_REPO/data/regimes" ]; then
  echo "Error: GOBL repo not found at $GOBL_REPO"
  echo "Usage: bash scripts/sync-data.sh [path-to-gobl-repo]"
  exit 1
fi

mkdir -p src/lib/data/regimes
mkdir -p src/lib/data/addons

echo "Copying regime data..."
cp "$GOBL_REPO"/data/regimes/*.json src/lib/data/regimes/
echo "  $(ls src/lib/data/regimes/ | wc -l | tr -d ' ') regime files copied"

echo "Copying addon data..."
cp "$GOBL_REPO"/data/addons/*.json src/lib/data/addons/
echo "  $(ls src/lib/data/addons/ | wc -l | tr -d ' ') addon files copied"

echo "Done!"
