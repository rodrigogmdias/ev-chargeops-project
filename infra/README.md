# Infraestrutura

Ambiente de demonstração numa VPS da DigitalOcean, servindo as duas superfícies
do protótipo sem depender de máquina local ligada.

| Recurso | Valor |
|---|---|
| Droplet | `apps-01` · s-2vcpu-4gb · Ubuntu 24.04 · NYC1 · compartilhado (Dokploy) |
| IP | `165.22.179.66` |
| DNS | `evchargeops.softmoon.io` → registro A na zona `softmoon.io` (DigitalOcean) |
| Portal | https://evchargeops.softmoon.io |
| App | https://evchargeops.softmoon.io/app (PWA) |

## Como está montado

Desde 2026-09-29 o protótipo divide o droplet `apps-01` com outros serviços
(antes tinha o droplet `evchargeops` só para ele). Tudo roda em Docker Compose,
em `/opt/evchargeops` (`docker-compose.yml` + `Caddyfile`, que ficam só no
servidor por causa do hash da senha do `/admin`):

| Serviço | Papel |
|---|---|
| `caddy` | Serve portal, PWA, `/ota` e `/admin` em HTTP; publica a **8081** direto no host |
| `painel` | `infra/admin/painel.py`, na rede do `caddy` (por isso `127.0.0.1:8090` funciona) |
| `coletor` | `infra/admin/coletor.py` em laço de 2 min, no lugar do timer do systemd |

O código e os builds continuam em `/srv/evchargeops`, montado no container. A
porta 443 é do **Traefik do Dokploy**, que termina TLS (Let's Encrypt) e
encaminha para o `caddy`; `trusted_proxies` no Caddyfile mantém o IP real do
visitante no log, que é o que o coletor conta.

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

### O QR antigo, com `exp://`, funciona

Um QR foi distribuído apontando para `exp://evchargeops.softmoon.io:8081`, do
antigo dev server. Ele **continua funcionando**: a porta 8081 passou a servir um
manifesto do protocolo `expo-updates` auto-hospedado.

Isso escapa das duas travas do Expo Go 57 — a exigência de login vale para
*modo de desenvolvimento*, e a de propriedade vale para *EAS Update*. Nenhuma
alcança updates auto-hospedados.

Quatro detalhes foram necessários, cada um custou uma rodada de erro:

1. **Bundle em JavaScript puro** (`expo export --no-bytecode`). O Expo Go só
   aceita bytecode Hermes vindo do EAS Update.
2. **`sdkVersion` em `extra.expoClient`**, senão dá "no SDK version specified".
   Vem de `npx expo config --type public --json`.
3. **`scopeKey` no topo de `extra`** — não dentro de `expoClient`, como se
   poderia supor. Confirmado inspecionando um manifesto real do EAS.
4. **Sem resposta 304.** Servido como arquivo estático, o Caddy revalidava o
   ETag e devolvia corpo vazio; o Expo Go ficava preso em "Opening project".
   Os `request_header -If-None-Match` e `-If-Modified-Since` resolvem.

**O simulador não serve para validar isto.** Ele entra em modo dev server,
fica pedindo `/message?role=ios` e trava mesmo com tudo correto. Só o aparelho
físico confirma.

Regenerar depois de mudar o app:

```bash
cd mobile
npx expo export --platform ios --platform android --no-bytecode --output-dir dist-ota
npx expo config --type public --json > dist-ota/expo-config.json
python3 ../infra/gerar-manifestos.py dist-ota https://evchargeops.softmoon.io/ota exposdk:57.0.0
rsync -az dist-ota/ root@165.22.179.66:/srv/evchargeops/ota/
```

Repare que a URL base dos manifestos é **`https://.../ota`**, e não a porta
8081 onde o manifesto é servido. O Android bloqueia HTTP em claro desde o 9, e
com os assets em `http://` o Expo Go ficava parado em "Checking for new
update...". O manifesto em si continua saindo pela 8081, porque é para lá que o
QR já distribuído aponta; só os arquivos que ele referencia mudaram de esquema.

Quem abrir `http://evchargeops.softmoon.io:8081` num navegador cai no PWA, por
redirecionamento.

## Contador de acessos

`/admin` mostra quantas pessoas abriram o protótipo, por onde e de onde. Fica
atrás de `basic_auth` no Caddy — o hash bcrypt vive só no servidor, em
`/opt/evchargeops/Caddyfile`, e a senha não está neste repositório.

A contagem **lê os logs de acesso do Caddy**, em vez de instrumentar o caminho
que serve o conteúdo: um erro no contador não tem como derrubar a demonstração,
e nada é injetado no bundle do app.

| Arquivo | Papel |
|---|---|
| [`admin/coletor.py`](admin/coletor.py) | Varre os logs a cada 2 min e alimenta o SQLite |
| [`admin/painel.py`](admin/painel.py) | Serve o painel em `127.0.0.1:8090`, só stdlib |

Um acesso conta quando alguém busca o **manifesto** do Expo Go (`/` na 8081,
com o header `expo-platform`) ou carrega o **PWA** (`/app`). Requisições de
asset não contam — senão uma única sessão viraria dezenas de acessos. O coletor
guarda a posição já lida de cada log em `posicoes.json`, então rotação de log e
execução repetida não duplicam contagem.

A **localização aproximada** vem do `ip-api.com`, uma consulta por IP novo,
guardada na tabela `geo`. É granularidade de cidade e operadora, o que o IP
permite; não é posição do aparelho.

```bash
cd /opt/evchargeops
docker compose logs painel                # o painel
docker compose logs coletor               # a coleta, de 2 em 2 min
docker compose exec coletor python3 -c "import sqlite3; print(sqlite3.connect('/data/acessos.db').execute('select count(*) from acessos').fetchone())"
```

**IP é dado pessoal sob a LGPD.** O painel avisa isso em rodapé; o banco deve
ser apagado quando o protótipo sair do ar.

## Atualizar

O repositório é privado e a VPS não tem credencial do GitHub — o código sobe por
`rsync` a partir da máquina de desenvolvimento:

```bash
./infra/deploy.sh
```

## Operação

```bash
ssh root@165.22.179.66
cd /opt/evchargeops

docker compose ps                           # estado dos serviços
docker compose logs caddy --tail 50         # log do Caddy
docker compose restart painel               # reiniciar o painel de acessos
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
```

## Limitações conhecidas

O bundle auto-hospedado é de **desenvolvimento**, em JavaScript puro: parte na
primeira abertura mais devagar que um build Hermes, e qualquer pessoa com o
link carrega o app. Para uma demo é aceitável; para distribuição de verdade o
caminho é EAS Update ou um build interno.

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
