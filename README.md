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

## Estado

- **`mobile/`** — protótipo navegável completo: 15 telas cobrindo entrada,
  consentimento LGPD, descoberta no mapa, limite de recarga, sessão ao vivo,
  tolerância e multa, recibo e histórico. Veja [`mobile/README.md`](mobile/README.md).
- **`web/`** — a construir.
