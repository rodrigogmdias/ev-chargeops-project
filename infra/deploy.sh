#!/usr/bin/env bash
# Sincroniza o código com a VPS e reconstrói o que mudou.
# Uso: ./infra/deploy.sh [portal|app|tudo]   (padrão: tudo)
set -euo pipefail

HOST="${EVCHARGEOPS_HOST:-root@104.248.14.57}"
KEY="${EVCHARGEOPS_KEY:-$HOME/.ssh/id_ed25519}"
ALVO="${1:-tudo}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "→ enviando código para $HOST"
rsync -az --delete \
  --exclude node_modules --exclude .git --exclude dist --exclude .expo \
  -e "ssh -i $KEY -o ConnectTimeout=20" \
  "$RAIZ/" "$HOST:/srv/evchargeops/"

if [ "$ALVO" = "portal" ] || [ "$ALVO" = "tudo" ]; then
  echo "→ reconstruindo o portal"
  ssh -i "$KEY" "$HOST" 'set -e; cd /srv/evchargeops/web; npm ci --silent; npm run build'
fi

if [ "$ALVO" = "app" ] || [ "$ALVO" = "tudo" ]; then
  echo "→ reiniciando o Metro"
  ssh -i "$KEY" "$HOST" 'set -e; cd /srv/evchargeops/mobile; npm ci --silent --legacy-peer-deps; systemctl restart expo-metro'
fi

echo "✓ portal: https://evchargeops.softmoon.io"
echo "✓ app:    exp://evchargeops.softmoon.io:8081"
