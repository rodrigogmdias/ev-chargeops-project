# EV ChargeOps

Protótipos do [EV ChargeOps](https://github.com/rodrigogmdias/ev-chargeops)
(Enterprise Challenge 2026 — FIAP × GoodWe), a partir do design system e dos
documentos de design do projeto.

O produto tem duas superfícies, com públicos e decisões diferentes:

| Pasta | Superfície | Público |
|---|---|---|
| [`mobile/`](mobile/) | App do morador (Expo / React Native) | Morador — encontra um ponto, recarrega, acompanha o consumo |
| [`web/`](web/) | Portal do condomínio | Síndico / administradora — capacidade elétrica, rateio, regras |

Cada pasta tem seu próprio `package.json` e é instalada e executada de forma
independente; não há workspace compartilhado. As instruções de execução ficam
no README de cada uma.

## Ambiente de demonstração

Ambas as superfícies estão no ar numa VPS, sem depender de máquina local:

| | Link | QR |
|---|---|---|
| **Portal** | https://evchargeops.softmoon.io | <img src="infra/qrcodes/portal-claro.png" width="150" alt="QR do portal"> |
| **App** | https://evchargeops.softmoon.io/app | <img src="infra/qrcodes/app-claro.png" width="150" alt="QR do app"> |

Os dois abrem em qualquer navegador, sem instalar nada e sem conta. O app é
servido como **PWA**: no iPhone, tocar em Compartilhar → *Adicionar à Tela de
Início* faz ele abrir em tela cheia, sem a barra do Safari e com ícone próprio.
Um aviso dentro do app lembra disso na primeira visita.

Outras variantes dos QR codes (escura para slide, SVG vetorial) e os detalhes de
infraestrutura estão em [`infra/`](infra/).

## Estado

- **`mobile/`** — protótipo navegável completo: 15 telas cobrindo entrada,
  consentimento LGPD, descoberta no mapa, limite de recarga, sessão ao vivo,
  tolerância e multa, recibo e histórico. Veja [`mobile/README.md`](mobile/README.md).
- **`web/`** — portal implementado a partir do design `Portal do Condominio.dc.html`:
  7 telas cobrindo visão geral, rateio com exportação CSV, cadastro de moradores,
  pontos e capacidade, regras, sessões e configurações. Veja [`web/README.md`](web/README.md).
