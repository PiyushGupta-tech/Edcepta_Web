#!/usr/bin/env bash
# Deploy to server when SSH works. Usage:
#   chmod +x deploy-rsync.sh
#   ./deploy-rsync.sh root@185.199.53.121
set -euo pipefail
HOST="${1:?Usage: $0 user@host}"
REMOTE_DIR="/www/wwwroot/zohanedu"
ROOT="$(cd "$(dirname "$0")" && pwd)"
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.cursor' \
  --exclude 'node_modules' \
  --exclude 'server.js' \
  --exclude 'script-api.js.bak' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"
echo "Done. Files synced to $HOST:$REMOTE_DIR"
