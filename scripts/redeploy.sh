#!/bin/bash
# Redeploy QAMind.ai to VPS from your Mac.
# Usage: ./scripts/redeploy.sh

set -euo pipefail

VPS_HOST="${VPS_HOST:-root@157.20.215.168}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVE="/tmp/qamind-deploy.tar.gz"

echo "==> Packaging app from $REPO_ROOT..."
cd "$REPO_ROOT"
tar czf "$ARCHIVE" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.output \
  --exclude=dist \
  --exclude=.cursor \
  .

echo "==> Uploading to $VPS_HOST..."
scp "$ARCHIVE" "$VPS_HOST:/tmp/qamind-deploy.tar.gz"
scp "$REPO_ROOT/scripts/vps-build.sh" "$VPS_HOST:/tmp/vps-build.sh"

echo "==> Building and restarting on server..."
ssh "$VPS_HOST" "chmod +x /tmp/vps-build.sh && bash /tmp/vps-build.sh"

echo "==> Done. Open https://qamind.ai"
