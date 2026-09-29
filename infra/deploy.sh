#!/usr/bin/env bash
# Sincroniza o código com a VPS e reconstrói o que mudou.
# Uso: ./infra/deploy.sh [portal|app|tudo]   (padrão: tudo)
set -euo pipefail

HOST="${EVCHARGEOPS_HOST:-root@165.22.179.66}"
KEY="${EVCHARGEOPS_KEY:-$HOME/.ssh/id_ed25519}"
ALVO="${1:-tudo}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "→ enviando código para $HOST"
# /ota e /app-web só existem no servidor (manifestos do QR exp:// e build do
# PWA). Excluídos, o --delete não os apaga — sem isso, um deploy só do portal
# derrubaria o QR já distribuído.
rsync -az --delete \
  --exclude node_modules --exclude .git --exclude dist --exclude .expo \
  --exclude /ota --exclude /app-web \
  -e "ssh -i $KEY -o ConnectTimeout=20" \
  "$RAIZ/" "$HOST:/srv/evchargeops/"

if [ "$ALVO" = "portal" ] || [ "$ALVO" = "tudo" ]; then
  echo "→ reconstruindo o portal"
  ssh -i "$KEY" "$HOST" 'set -e; cd /srv/evchargeops/web; npm ci --silent; npm run build'
fi

if [ "$ALVO" = "app" ] || [ "$ALVO" = "tudo" ]; then
  echo "→ gerando o build web do app"
  # O app é servido como web para que qualquer pessoa abra pelo QR, sem
  # instalar nada e sem conta Expo. O Expo Go deixou de servir para
  # demonstração aberta: desde o 57 no iOS exige login e membresia.
  ssh -i "$KEY" "$HOST" 'set -e
    cd /srv/evchargeops/mobile
    npm ci --silent --legacy-peer-deps
    npx expo export --platform web --output-dir dist-web
    rm -rf /srv/evchargeops/app-web
    mv dist-web /srv/evchargeops/app-web
    chmod -R 755 /srv/evchargeops/app-web'
fi

# O painel carrega o código uma vez; o coletor roda um processo novo a cada
# ciclo e já pega a versão sincronizada.
echo "→ reiniciando o painel de acessos"
ssh -i "$KEY" "$HOST" 'cd /opt/evchargeops && docker compose restart painel'

echo "✓ portal: https://evchargeops.softmoon.io"
echo "✓ app:    https://evchargeops.softmoon.io/app"
