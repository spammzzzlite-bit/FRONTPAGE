#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node -v
systemctl restart qamind
sleep 3
systemctl is-active qamind
curl -sI http://127.0.0.1:3000 | head -8
curl -sI https://qamind.ai | head -8
