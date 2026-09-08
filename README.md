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
| **App** | [abrir no Expo Go](exp://u.expo.dev/3b0cdfae-37dc-44a2-acbb-b2b09e9331d6?channel-name=preview&runtime-version=exposdk:57.0.0) | <img src="infra/qrcodes/app-claro.png" width="150" alt="QR do app"> |

O portal abre em qualquer navegador. O app exige o **Expo Go 57.x** e, desde
essa versão no iOS, que a pessoa esteja **logada no Expo Go** — e que a conta
tenha acesso ao projeto. Para liberar alguém, adicione a conta à organização em
[expo.dev](https://expo.dev/accounts/rodrigogmdias/settings/members).

O QR do app usa o esquema `exp://`: a câmera do iPhone reconhece e oferece abrir
no Expo Go, mas leitores genéricos de QR podem recusar um esquema que não
conhecem. Se acontecer, use "Enter URL manually" dentro do Expo Go.

Outras variantes dos QR codes (escura para slide, SVG vetorial) e os detalhes de
infraestrutura estão em [`infra/`](infra/).

## Estado

- **`mobile/`** — protótipo navegável completo: 15 telas cobrindo entrada,
  consentimento LGPD, descoberta no mapa, limite de recarga, sessão ao vivo,
  tolerância e multa, recibo e histórico. Veja [`mobile/README.md`](mobile/README.md).
- **`web/`** — portal implementado a partir do design `Portal do Condominio.dc.html`:
  7 telas cobrindo visão geral, rateio com exportação CSV, cadastro de moradores,
  pontos e capacidade, regras, sessões e configurações. Veja [`web/README.md`](web/README.md).
