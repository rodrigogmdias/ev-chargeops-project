#!/usr/bin/env python3
"""
Contador de acessos ao protótipo.

Lê os logs de acesso do Caddy e registra quem abriu o app, em vez de
instrumentar o caminho que serve o conteúdo — assim a coleta não tem como
derrubar a demonstração.

Um acesso conta quando alguém busca o manifesto do Expo Go (porta 8081) ou
carrega o PWA (/app). Requisições de assets não contam, senão uma sessão
viraria dezenas de acessos.
"""
import json
import os
import sqlite3
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

BASE = os.environ.get('ADMIN_BASE', '/srv/evchargeops/admin')
BANCO = os.path.join(BASE, 'acessos.db')
LOGS = [
    ('/var/log/caddy/ota-access.log', 'expo'),
    ('/var/log/caddy/access.log', 'pwa'),
]
# Cada linha de log tem posição; guardamos até onde já lemos.
ESTADO = os.path.join(BASE, 'posicoes.json')


def conectar():
    con = sqlite3.connect(BANCO)
    con.execute('''CREATE TABLE IF NOT EXISTS acessos (
        ip TEXT NOT NULL,
        origem TEXT NOT NULL,
        plataforma TEXT,
        primeiro TEXT NOT NULL,
        ultimo TEXT NOT NULL,
        total INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (ip, origem)
    )''')
    con.execute('''CREATE TABLE IF NOT EXISTS geo (
        ip TEXT PRIMARY KEY,
        cidade TEXT, regiao TEXT, pais TEXT, operadora TEXT,
        consultado_em TEXT
    )''')
    con.execute('''CREATE TABLE IF NOT EXISTS diario (
        dia TEXT NOT NULL, origem TEXT NOT NULL, ips INTEGER NOT NULL,
        PRIMARY KEY (dia, origem)
    )''')
    con.commit()
    return con


def conta(entrada, origem):
    """Decide se a linha de log representa alguém abrindo o app."""
    req = entrada.get('request', {})
    uri = req.get('uri', '')
    status = entrada.get('status', 0)
    if status >= 400:
        return None

    cabecalhos = {k.lower(): v for k, v in (req.get('headers') or {}).items()}
    plataforma = (cabecalhos.get('expo-platform') or [None])[0]

    if origem == 'expo':
        # Só o manifesto na raiz; assets não contam.
        if uri != '/' or not plataforma:
            return None
        return plataforma

    # PWA: a entrada é o documento HTML, não os assets.
    if uri in ('/app/', '/app', '/app/login', '/app/index.html'):
        return 'web'
    return None


def ler_posicoes():
    try:
        with open(ESTADO) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def gravar_posicoes(p):
    with open(ESTADO, 'w') as f:
        json.dump(p, f)


def ingerir(con):
    posicoes = ler_posicoes()
    novos = 0

    for caminho, origem in LOGS:
        if not os.path.exists(caminho):
            continue
        tamanho = os.path.getsize(caminho)
        inicio = posicoes.get(caminho, 0)
        # Log rotacionado ou truncado: recomeça do zero.
        if inicio > tamanho:
            inicio = 0

        with open(caminho, 'r', errors='replace') as f:
            f.seek(inicio)
            for linha in f:
                linha = linha.strip()
                if not linha:
                    continue
                try:
                    e = json.loads(linha)
                except ValueError:
                    continue
                plataforma = conta(e, origem)
                if not plataforma:
                    continue
                ip = e.get('request', {}).get('client_ip') or e.get('request', {}).get('remote_ip')
                if not ip:
                    continue
                quando = datetime.fromtimestamp(e.get('ts', time.time()), timezone.utc).isoformat()
                dia = quando[:10]
                con.execute('''INSERT INTO acessos (ip, origem, plataforma, primeiro, ultimo, total)
                    VALUES (?,?,?,?,?,1)
                    ON CONFLICT(ip, origem) DO UPDATE SET
                        ultimo=excluded.ultimo, total=total+1,
                        plataforma=COALESCE(excluded.plataforma, plataforma)''',
                    (ip, origem, plataforma, quando, quando))
                con.execute('''INSERT INTO diario (dia, origem, ips) VALUES (?,?,1)
                    ON CONFLICT(dia, origem) DO UPDATE SET ips=ips+1''', (dia, origem))
                novos += 1
            posicoes[caminho] = f.tell()

    con.commit()
    gravar_posicoes(posicoes)
    return novos


def geolocalizar(con, limite=40):
    """
    Resolve a localização aproximada dos IPs ainda sem geo.

    Consulta o ip-api.com, que não exige chave. Cada IP é consultado uma única
    vez e o resultado fica em cache — tanto pelo limite de 45 req/min do
    serviço quanto para não repassar os IPs mais do que o necessário.
    """
    pendentes = [r[0] for r in con.execute(
        'SELECT DISTINCT a.ip FROM acessos a LEFT JOIN geo g ON g.ip=a.ip WHERE g.ip IS NULL LIMIT ?',
        (limite,))]
    for ip in pendentes:
        cidade = regiao = pais = operadora = None
        try:
            url = f'http://ip-api.com/json/{ip}?fields=status,country,regionName,city,isp'
            with urllib.request.urlopen(url, timeout=8) as r:
                d = json.load(r)
            if d.get('status') == 'success':
                cidade, regiao = d.get('city'), d.get('regionName')
                pais, operadora = d.get('country'), d.get('isp')
        except (urllib.error.URLError, ValueError, TimeoutError):
            pass
        con.execute('''INSERT OR REPLACE INTO geo (ip, cidade, regiao, pais, operadora, consultado_em)
            VALUES (?,?,?,?,?,?)''',
            (ip, cidade, regiao, pais, operadora, datetime.now(timezone.utc).isoformat()))
        con.commit()
        time.sleep(1.5)  # folga sobre o limite de 45/min
    return len(pendentes)


if __name__ == '__main__':
    os.makedirs(BASE, exist_ok=True)
    c = conectar()
    n = ingerir(c)
    g = geolocalizar(c)
    print(f'{n} acessos novos · {g} IPs geolocalizados')
