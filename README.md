# EV ChargeOps — Protótipo mobile (Expo Go)

Protótipo navegável do **app do morador** do [EV ChargeOps](https://github.com/rodrigogmdias/ev-chargeops)
(Enterprise Challenge 2026 — FIAP × GoodWe), implementado a partir do design
"Recarga e Pagamento" do Claude Design e do design system EV ChargeOps.

## Rodar

```bash
npm install
npx expo start
```

Escaneie o QR code com o **Expo Go** (iOS/Android), ou pressione `i` / `a` para
abrir no simulador/emulador.

Para que alguém fora da sua rede consiga abrir, use o túnel:

```bash
npx expo start --tunnel
```

> **Expo SDK 54 — escolha deliberada.** É o último SDK cujo Expo Go está na
> App Store do iOS, então o app abre no Expo Go que qualquer iPhone consegue
> instalar hoje. O custo dessa escolha: o EAS Update **rejeita projetos SDK
> 54** desde 01/05/2026 (`sdkVersion 54.0.0 is not supported`), então não há
> link `u.expo.dev` — a distribuição é pelo túnel acima, com o servidor
> ligado. Para publicar um link permanente com cache no aparelho, o caminho é
> subir o projeto para o SDK 57 (`expo`, `react`, `react-native` +
> `expo install --fix`) e instalar o Expo Go 57 via
> [sign.expo.dev](https://sign.expo.dev) (iPhone) ou
> [expo.dev/go](https://expo.dev/go) (Android/simulador); o projeto EAS já
> existe (`extra.eas.projectId` no `app.json`) e o `runtimeVersion` já usa
> `policy: "sdkVersion"`, a única que o Expo Go carrega.

## Fluxos cobertos (13 telas + extras)

| # | Tela | Rota |
|---|---|---|
| 01 | Entrar | `/login` |
| 02 | Verificação por código (teclado próprio) | `/verificacao` |
| 03 | Vínculo com a unidade | `/vinculo` |
| 04 | Consentimento LGPD | `/consentimento` |
| 05 | Buscar pontos (Google Maps custom + lista + filtros) | `/(tabs)/buscar` |
| 06 | Detalhe do ponto (Grupo A/B + fila) | `/ponto/[id]` |
| 07 | Cartão e pré-autorização | `/pagamento` |
| 08 | Novo cartão (preview animado) | `/novo-cartao` |
| 09 | Liberando o carregador (passos SEMS) | `/liberando` |
| 10 | Recarga ao vivo (anel + telemetria + throttling) | `/sessao` |
| 11 | Tolerância e multa (o mesmo anel, esvaziando) | `/tolerancia` |
| 12 | Recibo da sessão | `/recibo` |
| 13 | Notificações | `/(tabs)/avisos` |

Extras: bottom sheet de fila com gesto de arrastar, toast global, aba Recarga com
resumo da sessão ativa, badge verde na tab durante a recarga.

## Simulação

A telemetria é simulada como no protótipo de design: a sessão acumula kWh a
7,4 kW, sofre *throttling* para 4,5 kW no meio (banner âmbar explica o motivo),
a tolerância conta 10 minutos regressivos e a multa de ocupação corre a
R$ 0,25/min. "Pular a tolerância" acelera a demonstração.

## Mapa

- **Android**: Google Maps (`PROVIDER_GOOGLE`) com estilo escuro customizado
  casado com os tokens do design system (`src/theme/mapStyle.js`). No Expo Go
  o mapa Google funciona sem chave; para build própria, preencha
  `android.config.googleMaps.apiKey` no `app.json`.
- **iOS (Expo Go)**: o Expo Go não suporta o provider Google no iOS, então cai
  no Apple Maps em modo escuro (`userInterfaceStyle="dark"`). Numa *dev build*
  (`npx expo run:ios`), preencha `ios.config.googleMapsApiKey` para ter o
  Google Maps customizado também no iOS.

## Design system

Tokens portados de `_ds/ev-chargeops-design-system` (cores, tipografia Nunito +
JetBrains Mono, espaçamento, raios, elevação e motion) em `src/theme/tokens.js`.
Componentes em `src/components/`: Button, Card, ListRow, MetricTile, StatusPill,
InfoBanner, TextField, Toggle, AppBar, TabBar custom, ProgressMeter, Ring,
Sheet, Toast. Motion segue as regras do DS — curto, plano e sem bounce
(140/200/280/320 ms, `cubic-bezier(.2,0,.2,1)` e `.16,1,.3,1` para sheets),
press em `scale(0.97)`, e o anel de progresso é a única animação contínua.
