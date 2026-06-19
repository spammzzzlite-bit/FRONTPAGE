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
tar xzf "$ARCHIVE" -C "$APP_DIR"

echo "==> Writing .env..."
cat > "$APP_DIR/.env" << 'ENVEOF'
VITE_SUPABASE_URL=https://xlrgteezusfeinbnhzhq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_n8e7Ey4A1gNa7fW3uTgQHA_zmAOeuEE
VITE_GOOGLE_CLIENT_ID=283486130787-jvvmh5aokrpjvo38ff3fdbgqaa4kp3ac.apps.googleusercontent.com
ENVEOF

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
