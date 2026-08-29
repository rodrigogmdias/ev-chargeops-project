# Portal do condomínio

Protótipo do portal do síndico/administradora do EV ChargeOps: o lugar onde o
condomínio **tira o relatório do rateio** e **cadastra os moradores**.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173.

## Telas

| Rota | Tela |
|---|---|
| `/` | **Visão geral** — demanda instantânea contra a contratada, eventos de throttling, estado dos pontos |
| `/rateio` | **Rateio** — fechamento mensal por unidade, com exportação CSV |
| `/moradores` | **Moradores** — cadastro, busca e convite de primeiro acesso |

## Decisões

**Vite + React, sem workspace compartilhado com `mobile/`.** As duas superfícies
não compartilham código hoje; o que elas compartilham é o design system, e ele
entra aqui como CSS custom properties em `src/styles/tokens.css` — portadas do
`_ds/ev-chargeops-design-system`, sem tradução, já que a web consome as
variáveis originais.

**Gráficos em CSS, sem biblioteca.** O design system especifica barras em CSS
para o portal; uma dependência de charts não se justificaria no protótipo.

**Os dados são simulados** (`src/data/condominio.js`), coerentes com o app do
morador: mesma tarifa de R$ 0,89/kWh repassada a custo, taxa de acesso de
R$ 35,00 por unidade, taxa de ocupação de R$ 0,25/min após 10 min de tolerância
e demanda contratada de 45 kW. O cadastro de morador vive em memória — recarregar
a página volta ao estado inicial.
