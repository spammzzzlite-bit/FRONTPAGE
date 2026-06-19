#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
APP_DIR=/var/www/qamind.ai

echo "==> Installing Node.js 20 if needed..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> Cloning or updating app..."
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull --ff-only
else
  git clone https://github.com/rahul1818/qamind.ai.git "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> Configuring Node server build..."
python3 << 'PY'
from pathlib import Path
p = Path("vite.config.ts")
text = p.read_text()
if "node-server" not in text:
    text = text.replace(
        "export default defineConfig({",
        'export default defineConfig({\n  nitro: {\n    preset: "node-server",\n  },',
    )
    p.write_text(text)
    print("patched vite.config.ts")
else:
    print("vite.config.ts already patched")
PY

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
