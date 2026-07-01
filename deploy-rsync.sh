#!/usr/bin/env bash
# Deploy to server when SSH works. Usage:
#   chmod +x deploy-rsync.sh
#   ./deploy-rsync.sh root@185.199.53.121
set -euo pipefail
HOST="${1:?Usage: $0 user@host}"
SSH_PORT="${SSH_PORT:-21761}"
REMOTE_DIR="/www/wwwroot/Edcepta"
ROOT="$(cd "$(dirname "$0")" && pwd)"
RSYNC_SSH="ssh -p ${SSH_PORT}"
if [[ -n "${SSHPASS:-}" ]]; then
  RSYNC_SSH="sshpass -e ssh -p ${SSH_PORT} -o StrictHostKeyChecking=accept-new"
fi
rsync -avz --delete \
  -e "$RSYNC_SSH" \
  --exclude '.user.ini' \
  --exclude '.well-known/' \
  --exclude '.git' \
  --exclude '.cursor' \
  --exclude 'node_modules' \
  --exclude 'server.js' \
  --exclude 'script-api.js.bak' \
  --exclude '.tmp-zohan*' \
  --exclude 'nginx-zohanedu-snippet.conf' \
  --exclude '__MACOSX' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"
echo "Done. Files synced to $HOST:$REMOTE_DIR"
