#!/usr/bin/env python3
"""Painel de acessos ao protótipo. Servido atrás de autenticação no Caddy."""
import html
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer

BASE = os.environ.get('ADMIN_BASE', '/srv/evchargeops/admin')
BANCO = os.path.join(BASE, 'acessos.db')
PORTA = int(os.environ.get('ADMIN_PORT', '8090'))

ROTULO_ORIGEM = {'expo': 'Expo Go', 'pwa': 'Navegador'}
ROTULO_PLATAFORMA = {'ios': 'iOS', 'android': 'Android', 'web': 'Web'}


def consultar():
    if not os.path.exists(BANCO):
        return {'total': 0, 'linhas': [], 'por_origem': [], 'por_dia': [], 'ultimos7': 0}
    con = sqlite3.connect(BANCO)
    con.row_factory = sqlite3.Row

    linhas = con.execute('''
        SELECT a.ip, a.origem, a.plataforma, a.primeiro, a.ultimo, a.total,
               g.cidade, g.regiao, g.pais, g.operadora
        FROM acessos a LEFT JOIN geo g ON g.ip = a.ip
        ORDER BY a.ultimo DESC LIMIT 500''').fetchall()

    total = con.execute('SELECT COUNT(DISTINCT ip) FROM acessos').fetchone()[0]
    por_origem = con.execute(
        'SELECT origem, COUNT(DISTINCT ip) n FROM acessos GROUP BY origem ORDER BY n DESC').fetchall()
    por_plataforma = con.execute(
        'SELECT plataforma, COUNT(DISTINCT ip) n FROM acessos GROUP BY plataforma ORDER BY n DESC').fetchall()
    por_dia = con.execute(
        'SELECT dia, SUM(ips) n FROM diario GROUP BY dia ORDER BY dia DESC LIMIT 14').fetchall()

    corte = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    ultimos7 = con.execute(
        'SELECT COUNT(DISTINCT ip) FROM acessos WHERE ultimo >= ?', (corte,)).fetchone()[0]

    return {'total': total, 'linhas': linhas, 'por_origem': por_origem,
            'por_plataforma': por_plataforma, 'por_dia': por_dia, 'ultimos7': ultimos7}


def quando(iso):
    try:
        d = datetime.fromisoformat(iso).astimezone(timezone(timedelta(hours=-3)))
        return d.strftime('%d/%m · %H:%M')
    except (ValueError, TypeError):
        return '—'


def local(r):
    partes = [p for p in (r['cidade'], r['regiao'], r['pais']) if p]
    return ' · '.join(partes) if partes else '—'


def render(d):
    kpis = f'''
      <div class="grid">
        <div class="card"><div class="eyebrow">Pessoas únicas</div>
          <div class="metric">{d['total']}</div>
          <div class="hint">Contadas por IP distinto</div></div>
        <div class="card"><div class="eyebrow">Últimos 7 dias</div>
          <div class="metric">{d['ultimos7']}</div>
          <div class="hint">Com acesso recente</div></div>
    '''
    for r in d['por_origem']:
        kpis += f'''<div class="card"><div class="eyebrow">{ROTULO_ORIGEM.get(r['origem'], r['origem'])}</div>
          <div class="metric">{r['n']}</div>
          <div class="hint">Pessoas por esse caminho</div></div>'''
    kpis += '</div>'

    plataformas = ''
    if d.get('por_plataforma'):
        itens = ''.join(
            f'<div class="linha"><span>{ROTULO_PLATAFORMA.get(r["plataforma"], r["plataforma"] or "—")}</span>'
            f'<span class="num">{r["n"]}</span></div>'
            for r in d['por_plataforma'])
        plataformas = f'<section><h2 class="eyebrow">Por plataforma</h2><div class="card lista">{itens}</div></section>'

    dias = ''
    if d['por_dia']:
        maximo = max(r['n'] for r in d['por_dia']) or 1
        barras = ''.join(
            f'<div class="barra-col"><div class="barra-num">{r["n"]}</div>'
            f'<div class="barra" style="height:{max(4, round(r["n"] / maximo * 90))}px"></div>'
            f'<div class="barra-dia">{r["dia"][8:10]}/{r["dia"][5:7]}</div></div>'
            for r in reversed(d['por_dia']))
        dias = f'<section><h2 class="eyebrow">Acessos por dia</h2><div class="card"><div class="grafico">{barras}</div></div></section>'

    corpo = ''.join(
        f'''<tr>
          <td class="mono forte">{html.escape(r['ip'])}</td>
          <td>{html.escape(local(r))}<div class="sub">{html.escape(r['operadora'] or '')}</div></td>
          <td>{ROTULO_ORIGEM.get(r['origem'], r['origem'])}<div class="sub">{ROTULO_PLATAFORMA.get(r['plataforma'], r['plataforma'] or '')}</div></td>
          <td class="dir mono">{r['total']}</td>
          <td class="dir mono">{quando(r['primeiro'])}</td>
          <td class="dir mono">{quando(r['ultimo'])}</td>
        </tr>''' for r in d['linhas'])
    if not corpo:
        corpo = '<tr><td colspan="6" class="vazio">Nenhum acesso registrado ainda</td></tr>'

    return f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Acessos · EV ChargeOps</title>
<style>
:root {{
  --bg:#0B0B0D; --canvas:#121214; --card:#1C1C1F; --inset:#26262A;
  --title:#FFFFFF; --body:#DEDEE2; --muted:#B4B4BA; --subtle:#7C7C84; --disabled:#57575E;
  --hair:rgba(255,255,255,.07); --accent:#E8121F; --green:#26D07C;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,monospace;
}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--body);
  font-family:Nunito,system-ui,-apple-system,sans-serif;font-size:15px;line-height:22px}}
.topo{{height:64px;display:flex;align-items:center;gap:12px;padding:0 24px;
  background:rgba(18,18,20,.86);border-bottom:1px solid var(--hair);position:sticky;top:0}}
.topo b{{font-size:17px;color:var(--title)}}
.topo span{{font-size:12px;color:var(--subtle)}}
main{{padding:24px;max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:24px}}
.eyebrow{{font-size:11px;font-weight:800;letter-spacing:.9px;text-transform:uppercase;
  color:var(--subtle);margin:0 0 10px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}}
.card{{background:var(--card);border-radius:16px;padding:16px}}
.metric{{font-family:var(--mono);font-size:26px;font-weight:700;color:var(--title);letter-spacing:-.4px}}
.hint{{font-size:12px;color:var(--subtle);margin-top:4px}}
.lista .linha{{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--hair)}}
.lista .linha:last-child{{border-bottom:0}}
.num{{font-family:var(--mono);font-weight:700;color:var(--title)}}
.grafico{{display:flex;align-items:flex-end;gap:10px;height:130px}}
.barra-col{{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;justify-content:flex-end;height:100%}}
.barra{{width:100%;border-radius:6px 6px 3px 3px;background:rgba(38,208,124,.5)}}
.barra-num{{font-family:var(--mono);font-size:11px;color:var(--muted)}}
.barra-dia{{font-size:11px;color:var(--subtle)}}
table{{width:100%;border-collapse:collapse;font-size:14px}}
th{{text-align:left;padding:12px 16px;font-size:11px;font-weight:800;letter-spacing:.9px;
  text-transform:uppercase;color:var(--subtle);border-bottom:1px solid var(--hair)}}
td{{padding:12px 16px;border-bottom:1px solid var(--hair);vertical-align:top}}
tr:last-child td{{border-bottom:0}}
.mono{{font-family:var(--mono);font-size:13px}}
.forte{{color:var(--title);font-weight:700}}
.dir{{text-align:right}}
.sub{{font-size:12px;color:var(--subtle);margin-top:2px}}
.vazio{{text-align:center;color:var(--subtle);padding:48px 0}}
.aviso{{background:rgba(74,144,226,.16);border-radius:16px;padding:14px 16px;font-size:13px;line-height:19px}}
.aviso b{{color:#6BA9EE;display:block;margin-bottom:2px}}
.tabela{{background:var(--card);border-radius:16px;overflow:hidden}}
.rolar{{overflow-x:auto}}
@media(max-width:640px){{main{{padding:16px}}.topo{{padding:0 16px}}}}
</style></head>
<body>
<header class="topo"><b>Acessos</b><span>EV ChargeOps · protótipo</span></header>
<main>
  {kpis}
  {dias}
  {plataformas}
  <section>
    <h2 class="eyebrow">Quem acessou</h2>
    <div class="tabela"><div class="rolar"><table>
      <thead><tr><th>IP</th><th>Localização aproximada</th><th>Origem</th>
        <th class="dir">Aberturas</th><th class="dir">Primeiro</th><th class="dir">Último</th></tr></thead>
      <tbody>{corpo}</tbody>
    </table></div></div>
  </section>
  <div class="aviso"><b>Dado pessoal</b>
    Endereço IP identifica uma pessoa sob a LGPD, e a localização vem de consulta ao
    ip-api.com. Mantenha esta página restrita e apague o banco quando o protótipo sair do ar.</div>
</main>
</body></html>'''


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.rstrip('/') not in ('', '/admin', '/admin/acessos'):
            self.send_error(404)
            return
        pagina = render(consultar()).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(pagina)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(pagina)

    def log_message(self, *args):
        pass  # o Caddy já registra


if __name__ == '__main__':
    HTTPServer(('127.0.0.1', PORTA), Handler).serve_forever()
