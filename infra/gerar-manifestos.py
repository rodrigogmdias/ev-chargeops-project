#!/usr/bin/env python3
"""
Gera os manifestos do protocolo expo-updates v1 a partir de um export nativo.

Serve para que o Expo Go abra `exp://evchargeops.softmoon.io:8081` — o QR que
já foi distribuído. Como é update auto-hospedado (e não EAS Update), não vale a
restrição de propriedade nem a de login, que se aplicam a EAS e a dev server.

O bundle precisa ser JavaScript puro: o Expo Go só aceita bytecode Hermes vindo
do EAS Update. Por isso o export usa --no-bytecode.

Cada manifesto vira um corpo multipart/mixed pronto, servido estaticamente pelo
Caddy conforme o header expo-platform.
"""
import hashlib
import json
import mimetypes
import os
import sys
import uuid
from datetime import datetime, timezone

BASE = sys.argv[1] if len(sys.argv) > 1 else 'dist-ota'
URL = sys.argv[2] if len(sys.argv) > 2 else 'http://evchargeops.softmoon.io:8081'
RUNTIME = sys.argv[3] if len(sys.argv) > 3 else 'exposdk:57.0.0'
FRONTEIRA = 'evchargeopsboundary'

TIPOS = {'ttf': 'font/ttf', 'otf': 'font/otf', 'png': 'image/png',
         'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'json': 'application/json'}


def hash_base64url(caminho):
    """SHA-256 em base64url sem padding, como o protocolo exige."""
    import base64
    with open(caminho, 'rb') as f:
        digest = hashlib.sha256(f.read()).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip('=')


def key_de(caminho):
    """A chave é o nome do arquivo sem extensão, como o EAS faz."""
    return os.path.splitext(os.path.basename(caminho))[0]


def montar(plataforma, meta, config, scope_key):
    dados = meta['fileMetadata'][plataforma]
    bundle = dados['bundle']

    ativos = []
    for a in dados['assets']:
        rel = a['path']
        ext = a['ext']
        ativos.append({
            'hash': hash_base64url(os.path.join(BASE, rel)),
            'key': key_de(rel),
            'contentType': TIPOS.get(ext, mimetypes.guess_type('x.' + ext)[0] or 'application/octet-stream'),
            'fileExtension': '.' + ext,
            'url': f'{URL}/{rel}',
        })

    manifesto = {
        'id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'{URL}/{plataforma}/{bundle}')),
        'createdAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'runtimeVersion': RUNTIME,
        'launchAsset': {
            'hash': hash_base64url(os.path.join(BASE, bundle)),
            'key': key_de(bundle),
            'contentType': 'application/javascript',
            'url': f'{URL}/{bundle}',
        },
        'assets': ativos,
        'metadata': {},
        'extra': {'expoClient': config, 'scopeKey': scope_key},
    }

    corpo = (
        f'--{FRONTEIRA}\r\n'
        'Content-Disposition: form-data; name="manifest"\r\n'
        'Content-Type: application/json\r\n\r\n'
        # separators sem espaço e ASCII puro, como o EAS serializa.
        + json.dumps(manifesto, separators=(',', ':')) + '\r\n'
        f'--{FRONTEIRA}--\r\n'
    )
    return corpo, len(ativos)


def main():
    meta = json.load(open(os.path.join(BASE, 'metadata.json')))
    caminho_config = os.path.join(BASE, 'expo-config.json')
    if not os.path.exists(caminho_config):
        raise SystemExit(
            'expo-config.json ausente. Gere com: npx expo config --type public --json'
        )
    bruto = json.load(open(caminho_config))
    config = bruto.get('expo', bruto)
    # Sem sdkVersion o Expo Go recusa com "no SDK version specified".
    if not config.get('sdkVersion'):
        raise SystemExit('expo-config.json sem sdkVersion')

    # O scopeKey normalmente é injetado pela infraestrutura da Expo. Num
    # manifesto auto-hospedado precisa ser declarado, e vai no topo de `extra`
    # — não dentro de expoClient, como confirmado num manifesto real do EAS.
    # Sem ele o Expo Go falha com "Value for (key = scopeKey) is null".
    #
    # Ele NÃO pode apontar para a conta Expo: com @dono/slug, o Expo Go tenta
    # resolver o escopo contra a conta logada e quem não é o dono fica preso
    # em "Opening project". Um escopo anônimo desvincula o manifesto da conta.
    config.pop('owner', None)
    extra_config = config.get('extra') or {}
    extra_config.pop('eas', None)
    config['extra'] = extra_config

    for plataforma in ('ios', 'android'):
        if plataforma not in meta['fileMetadata']:
            continue
        scope_key = f"@anonymous/{config.get('slug', 'app')}"
        corpo, n = montar(plataforma, meta, config, scope_key)
        destino = os.path.join(BASE, f'manifesto-{plataforma}.multipart')
        with open(destino, 'w', encoding='utf-8') as f:
            f.write(corpo)
        print(f'{plataforma}: {n} assets · {len(corpo)} bytes → {os.path.basename(destino)}')


if __name__ == '__main__':
    main()
