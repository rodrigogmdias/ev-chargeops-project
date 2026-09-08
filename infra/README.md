# Infraestrutura

Ambiente de demonstração numa VPS da DigitalOcean, servindo as duas superfícies
do protótipo sem depender de máquina local ligada.

| Recurso | Valor |
|---|---|
| Droplet | `evchargeops` · s-1vcpu-2gb · Ubuntu 24.04 · NYC3 |
| IP | `104.248.14.57` |
| DNS | `evchargeops.softmoon.io` → registro A na zona `softmoon.io` (DigitalOcean) |
| Portal | https://evchargeops.softmoon.io |
| App | https://evchargeops.softmoon.io/app (PWA) |

## Como está montado

O **portal** é build estático (`web/dist`) servido pelo Caddy, que cuida do
certificado Let's Encrypt sozinho. O `try_files` devolve `index.html` para
qualquer rota, para o react-router funcionar em recarga direta de `/rateio` e
companhia.

O **app** roda como serviço systemd (`expo-metro`) com o Metro na porta 8081.
Duas variáveis importam: `REACT_NATIVE_PACKAGER_HOSTNAME` faz o manifesto
anunciar o domínio público em vez de um IP interno, e `CI=1` evita que o Metro
peça interação. A flag `--offline` é necessária porque o `app.json` tem um
`projectId` da EAS — sem ela o Metro tenta autenticar para assinar o manifesto
e morre em modo não-interativo. Também é incompatível com `--host`, daí a
ausência dessa flag.

Há 2 GB de swap: o bundling não cabe confortavelmente em 2 GB de RAM. A
primeira compilação leva ~3 min; as seguintes, segundos, com o cache do Metro
quente.

### Por que o app é servido como web

O requisito é que **qualquer pessoa com o QR code abra o protótipo**. O Expo Go
não atende mais a isso: desde o 57 no iOS ele exige login no aparelho e que a
conta seja membro da conta dona do projeto. Caminhos de instalação (APK,
TestFlight) também falham, porque excluem metade dos aparelhos ou exigem conta
Apple paga.

O app é então exportado para web (`expo export --platform web`, saída estática)
e servido em `/app`. Abre em qualquer navegador, sem instalar nada e sem conta.

**É uma PWA**: o `app/+html.jsx` traz o manifesto e as metatags da Apple, e o
`public/` traz os ícones. No iPhone, Compartilhar → *Adicionar à Tela de Início*
instala com ícone próprio e abre em **tela cheia**, sem a barra do Safari —
verificado no Safari do simulador. O componente `InstalarPWA.web.jsx` mostra
esse aviso na primeira visita, porque no iOS não existe prompt automático.

O `react-native-maps` não roda no navegador. `Mapa.web.jsx` substitui o mapa
pelo desenho abstrato do design original, projetando as mesmas coordenadas —
com um afastamento mínimo entre pinos, já que sem zoom os três pontos do
condomínio, a ~100 m entre si, se sobrepõem.

O serviço `expo-metro` foi desativado: não era mais usado e consumia memória.

## Atualizar

O repositório é privado e a VPS não tem credencial do GitHub — o código sobe por
`rsync` a partir da máquina de desenvolvimento:

```bash
./infra/deploy.sh
```

## Operação

```bash
ssh root@104.248.14.57

systemctl status caddy expo-metro     # estado dos serviços
journalctl -u caddy -n 50             # log do Caddy
tail -f /var/log/expo-metro.log       # log do Metro
systemctl restart expo-metro          # reiniciar o app
```

## Limitações conhecidas

O Metro serve bundle de **desenvolvimento**: cada abertura baixa os 13 MB de
novo, sem cache no aparelho, e qualquer pessoa com o link consegue carregar o
app. Para uma demo pública isso é aceitável; para distribuição de verdade o
caminho é EAS Update (exige SDK ≥ 57) ou um build interno.

O firewall (ufw) libera apenas 22, 80, 443 e 8081.

## QR codes

Em [`infra/qrcodes/`](qrcodes/), gerados com `segno` (correção de erro alta) e
validados módulo a módulo contra a codificação esperada:

| Arquivo | Uso |
|---|---|
| `portal-claro.png` · `app-claro.png` | Impressão e fundo branco |
| `portal-escuro.png` · `app-escuro.png` | Slide com o fundo escuro do produto |
| `portal.svg` · `app.svg` | Vetorial, para ampliar sem perda |

O QR do app aponta para `exp://`, um esquema customizado: a câmera do iPhone
reconhece e oferece abrir no Expo Go, mas leitores de QR genéricos podem
recusar. Se acontecer, use "Enter URL manually" dentro do Expo Go.
