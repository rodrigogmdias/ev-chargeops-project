# Portal do condomínio

Implementação do design `Portal do Condominio.dc.html` (Claude Design): o portal
do síndico e da administradora do EV ChargeOps.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173.

## Telas

| Rota | Tela |
|---|---|
| `/` | **Visão geral** — consumo do mês, gráfico semanal, capacidade elétrica, maiores consumos e checklist de fechamento |
| `/rateio` | **Rateio** — fechamento por unidade com busca, filtros, totais e exportação CSV |
| `/moradores` | **Moradores** — cadastro das 40 unidades, filtros por status e convite |
| `/pontos` | **Pontos e capacidade** — demanda contra o limite contratado e estado de cada ponto |
| `/regras` | **Regras e tarifas** — cobrança, tolerância, capacidade e uso |
| `/sessoes` | **Sessões** — medição bruta que origina o rateio |
| `/config` | **Configurações** — condomínio, administradora, formato do relatório e LGPD |

## Decisões

**Tokens sem tradução.** O design usa hex inline; aqui eles entram como CSS custom
properties em `src/styles/tokens.css`, portadas do design system do EV ChargeOps —
os valores são os mesmos, mas nomeados.

**Ícones via `lucide-react`.** O design referencia SVGs do `lucide-static` por CSS
mask e CDN; o pacote React evita a dependência de rede e renderiza mais nítido.

**Rotas em vez de estado de tela.** O design troca telas por estado interno; aqui
cada tela tem URL própria, o que permite link direto e o botão voltar. O estado
compartilhado (unidades, busca, filtros, convite, toast) fica em
`src/state/PortalState.jsx`.

**Dados determinísticos.** As 40 unidades vêm de um PRNG com semente fixa
(`buildUnidades`), como no design: os mesmos apartamentos, consumos e placas a cada
reload. Tarifa de R$ 0,89/kWh a custo, taxa de acesso de R$ 35,00, ocupação de
R$ 0,25/min e limite contratado de 75 kW. O convite vive em memória.
