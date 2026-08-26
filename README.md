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

> **Expo SDK 57.** O Expo Go carrega um único SDK por versão do app, então o
> aparelho precisa do Expo Go da linha `57.x`. Desde o SDK 55 o Expo Go **não
> está mais na App Store** (a última publicada lá foi a 54.x): para iPhone
> físico, instale por [sign.expo.dev](https://sign.expo.dev); para Android e
> simuladores, por [expo.dev/go](https://expo.dev/go). Com um Expo Go 54.x o
> app mostra "Project is incompatible with this version of Expo Go".

## Publicar um link (EAS Update)

Para alguém abrir sem você rodar o servidor:

```bash
npx eas-cli login
```

```bash
npx eas-cli init
```

```bash
npx eas-cli update --branch preview --message "protótipo"
```

O `runtimeVersion` está com `policy: "sdkVersion"` — é a única forma que o Expo
Go consegue carregar, porque update publicado com `runtimeVersion` literal só
abre em development build.

> **Limite importante:** desde 12/05/2026 o Expo Go só carrega updates que
> pertencem a você ou a uma organização da qual a conta logada é membro. Quem
> for testar precisa estar logado no Expo Go com uma conta adicionada à sua
> organização no [expo.dev](https://expo.dev). Para distribuir a qualquer
> pessoa, o caminho é `eas build` (APK no Android, TestFlight no iOS).

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
