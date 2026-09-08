# Infraestrutura

Ambiente de demonstração numa VPS da DigitalOcean, servindo as duas superfícies
do protótipo sem depender de máquina local ligada.

| Recurso | Valor |
|---|---|
| Droplet | `evchargeops` · s-1vcpu-2gb · Ubuntu 24.04 · NYC3 |
| IP | `104.248.14.57` |
| DNS | `evchargeops.softmoon.io` → registro A na zona `softmoon.io` (DigitalOcean) |
| Portal | https://evchargeops.softmoon.io |
| App | `exp://u.expo.dev/3b0cdfae-37dc-44a2-acbb-b2b09e9331d6?channel-name=preview&runtime-version=exposdk:57.0.0` |

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

### Por que o app não usa mais o dev server

A partir do **Expo Go 57 no iOS**, a Expo exige login nos dois lados: no app e
na CLI que serve o projeto, com as contas coincidindo. Um dev server público
não tem como satisfazer isso — a VPS não está logada, e mesmo que estivesse,
só abriria para quem usasse aquela mesma conta. A exigência não vale para
simuladores, o que mascara o problema em teste local.

Por isso o app é distribuído por **EAS Update**: o bundle vai para o CDN da
Expo, assinado, e o Expo Go carrega direto. Ganha cache no aparelho e abre em
segundos, contra os minutos do bundle de desenvolvimento de 13 MB.

Publicar uma nova versão:

```bash
cd mobile && npx eas-cli update --branch preview --environment preview --message "..."
```

**Quem pode abrir:** o dono do projeto e membros da organização Expo. Para dar
acesso a outra pessoa, adicione-a em
[expo.dev](https://expo.dev/accounts/rodrigogmdias/settings/members) e peça que
ela entre no Expo Go com a própria conta.

O serviço `expo-metro` continua na VPS para desenvolvimento com simulador, onde
a exigência de login não se aplica.

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
