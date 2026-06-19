#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
APP_DIR=/var/www/qamind.ai
ARCHIVE=/tmp/qamind-deploy.tar.gz

echo "==> Node versions:"
node -v
npm -v

echo "==> Extracting application..."
mkdir -p "$APP_DIR"
# Remove legacy route files superseded by newer deploys
rm -f "$APP_DIR/src/routes/_app.index.tsx"
tar xzf "$ARCHIVE" -C "$APP_DIR"

echo "==> Checking .env..."
if [ ! -f "$APP_DIR/.env" ]; then
  echo "ERROR: $APP_DIR/.env missing. Create it on the VPS before deploying."
  exit 1
fi

echo "==> Installing dependencies..."
cd "$APP_DIR"
npm install

echo "==> Building application..."
npm run build

echo "==> Creating systemd service..."
cat > /etc/systemd/system/qamind.service << 'SVCEOF'
[Unit]
Description=QAMind.ai Application
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/qamind.ai
Environment=PORT=3000
Environment=NODE_ENV=production
EnvironmentFile=/var/www/qamind.ai/.env
ExecStart=/usr/bin/node /var/www/qamind.ai/.output/server/index.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable qamind
systemctl restart qamind

sleep 3
echo "==> Service status:"
systemctl is-active qamind
systemctl status qamind --no-pager -l | head -20

echo "==> Health checks:"
curl -sI http://127.0.0.1:3000 | head -8
curl -sI https://qamind.ai | head -8

echo "==> Deploy complete."
