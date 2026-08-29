export const TARIFA = 0.89;
export const TAXA_ACESSO = 35;
export const TAXA_OCUPACAO = 0.25;
export const MES_REFERENCIA = 'agosto de 2026';
export const LIMITE_CONTRATADO = 75;
export const RESERVA_COMUM = 11.5;
export const DEMANDA_AGORA = 41.2;

const NOMES = ['Ana Ribeiro', 'Marcelo Tavares', 'Juliana Prado', 'Fernando Lisboa', 'Camila Nogueira', 'Rodrigo Sampaio', 'Beatriz Amaral', 'Thiago Vasconcelos', 'Patrícia Machado', 'Eduardo Bastos', 'Larissa Fontes', 'Gustavo Peixoto', 'Renata Coelho', 'Vinícius Andrade', 'Mariana Duarte', 'Otávio Rezende', 'Cristina Barreto', 'Leandro Furtado', 'Helena Quirino', 'Sérgio Mattos', 'Bruna Salgado', 'Alexandre Pires', 'Natália Cordeiro', 'Rafael Bittencourt', 'Isabela Menezes', 'Caio Monteiro', 'Verônica Alencar', 'Daniel Siqueira', 'Tatiana Braga', 'Murilo Cavalcanti', 'Sofia Rangel', 'Henrique Loureiro', 'Débora Vilela', 'Paulo Aragão', 'Elisa Trindade', 'Rogério Damasceno', 'Clara Bonfim', 'André Sarmento', 'Lúcia Estevam', 'Felipe Guimarães'];
const CARROS = ['BYD Dolphin', 'Volvo EX30', 'GWM Ora 03', 'Renault Kwid E-Tech', 'BMW iX1', 'Chevrolet Bolt', 'Fiat 500e', 'Caoa Chery iCar', 'Toyota Corolla Cross HEV', 'JAC E-JS1'];

export const brl = (n) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const num = (n, d = 2) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

/** PRNG determinístico: os mesmos 40 apartamentos em todo reload. */
function rng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

export function buildUnidades() {
  const r = rng(20260825);
  const out = [];
  for (let i = 0; i < 40; i++) {
    const torre = i < 20 ? 'A' : 'B';
    const andar = 1 + Math.floor((i % 20) / 4);
    const apto = andar * 10 + ((i % 4) + 1);
    const nome = NOMES[i];
    const x = r();
    // 27 unidades com consumo, 5 convites pendentes, 3 sem cadastro, resto ativo sem uso.
    const status = i < 27 ? 'ativo' : i < 32 ? 'ativo' : i < 37 ? 'pendente' : 'vazio';
    const sessoes = status === 'ativo' && i < 27 ? 1 + Math.floor(x * 7) : 0;
    const kwh = sessoes ? Math.round((sessoes * (6 + r() * 14)) * 100) / 100 : 0;
    const ocupMin = sessoes && r() > 0.72 ? 2 + Math.floor(r() * 12) : 0;
    out.push({
      id: `${torre}-${apto}`,
      unidade: `${torre} · ${apto}`,
      nome: status === 'vazio' ? 'Sem morador vinculado' : nome,
      cpf: status === 'vazio' ? '—' : `•••.•••.${100 + Math.floor(r() * 899)}-${10 + Math.floor(r() * 89)}`,
      email: status === 'vazio' ? '—'
        : `${nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, '.')}@email.com`,
      telefone: status === 'vazio' ? '—' : `(11) 9${7000 + Math.floor(r() * 2999)}-${1000 + Math.floor(r() * 8999)}`,
      placa: status === 'ativo' ? `ABC${1 + Math.floor(r() * 8)}D${10 + Math.floor(r() * 89)}` : '—',
      modelo: status === 'ativo' ? CARROS[Math.floor(r() * CARROS.length)] : '—',
      status, sessoes, kwh, ocupMin,
    });
  }
  return out;
}

/** Energia a custo + taxa de acesso de quem tem veículo + ocupação excedente. */
export function calc(u) {
  const energia = u.kwh * TARIFA;
  const taxa = u.status === 'ativo' ? TAXA_ACESSO : 0;
  const ocup = u.ocupMin * TAXA_OCUPACAO;
  return { energia, taxa, ocup, total: energia + taxa + ocup };
}

export const STATUS_LABEL = { ativo: 'Ativo', pendente: 'Convite enviado', vazio: 'Sem cadastro' };
export const STATUS_TOM = { ativo: 'charging', pendente: 'idle', vazio: 'offline' };

export const SESSOES = [
  { id: 'SESS-2026-08-25-0042', unidade: 'B · 42', ponto: 'Garagem L1 · Vaga 12', quando: '25/08 · 22:20', kwh: 11.76, tom: 'charging', status: 'Concluída' },
  { id: 'SESS-2026-08-25-0041', unidade: 'A · 31', ponto: 'Garagem L1 · Vaga 13', quando: '25/08 · 19:04', kwh: 16.40, tom: 'charging', status: 'Concluída' },
  { id: 'SESS-2026-08-24-0040', unidade: 'A · 12', ponto: 'Garagem L2 · Visitantes', quando: '24/08 · 08:12', kwh: 9.80, tom: 'idle', status: 'Ocupação 6 min' },
  { id: 'SESS-2026-08-23-0039', unidade: 'B · 51', ponto: 'Garagem L1 · Vaga 12', quando: '23/08 · 07:42', kwh: 18.20, tom: 'charging', status: 'Concluída' },
  { id: 'SESS-2026-08-23-0038', unidade: 'A · 24', ponto: 'Garagem L1 · Vaga 13', quando: '23/08 · 06:15', kwh: 4.05, tom: 'fault', status: 'Interrompida' },
  { id: 'SESS-2026-08-22-0037', unidade: 'B · 33', ponto: 'Garagem L2 · Visitantes', quando: '22/08 · 21:58', kwh: 22.40, tom: 'charging', status: 'Concluída' },
  { id: 'SESS-2026-08-21-0036', unidade: 'A · 41', ponto: 'Garagem L1 · Vaga 12', quando: '21/08 · 19:05', kwh: 7.30, tom: 'charging', status: 'Concluída' },
  { id: 'SESS-2026-08-20-0035', unidade: 'B · 22', ponto: 'Garagem L1 · Vaga 13', quando: '20/08 · 20:30', kwh: 14.90, tom: 'idle', status: 'Ocupação 3 min' },
  { id: 'SESS-2026-08-19-0034', unidade: 'A · 13', ponto: 'Garagem L1 · Vaga 12', quando: '19/08 · 21:30', kwh: 19.94, tom: 'charging', status: 'Concluída' },
  { id: 'SESS-2026-08-18-0033', unidade: 'B · 44', ponto: 'Garagem L2 · Visitantes', quando: '18/08 · 07:22', kwh: 6.12, tom: 'charging', status: 'Concluída' },
];

export const BARRAS = [['S1', 218.4], ['S2', 341.6], ['S3', 289.2], ['S4', 372.8], ['S5', 62.6]];
export const MAX_BARRA = 380;

export const PONTOS_RESUMO = [
  { nome: 'Garagem L1 · Vaga 12', kw: '7,0 kW', tom: 'charging' },
  { nome: 'Garagem L1 · Vaga 13', kw: '4,5 kW', tom: 'idle' },
  { nome: 'Garagem L2 · Visitantes', kw: '0,0 kW', tom: 'offline' },
];

export const PONTOS = [
  { id: 'L1-01', nome: 'Garagem L1 · Vaga 12', status: 'Carregando', tom: 'charging', linhas: [
    { label: 'Potência agora', valor: '7,0 kW' }, { label: 'Fator de rateio', valor: '0,8×' },
    { label: 'Energia no mês', valor: '486,2 kWh' }, { label: 'Sessões no mês', valor: '38' }] },
  { id: 'L1-02', nome: 'Garagem L1 · Vaga 13', status: 'Throttling', tom: 'idle', linhas: [
    { label: 'Potência agora', valor: '4,5 kW' }, { label: 'Fator de rateio', valor: '1,0×' },
    { label: 'Energia no mês', valor: '512,8 kWh' }, { label: 'Sessões no mês', valor: '41' }] },
  { id: 'L2-01', nome: 'Garagem L2 · Visitantes', status: 'Livre', tom: 'offline', linhas: [
    { label: 'Potência agora', valor: '0,0 kW' }, { label: 'Fator de rateio', valor: '1,5×' },
    { label: 'Energia no mês', valor: '285,6 kWh' }, { label: 'Sessões no mês', valor: '23' }] },
];

export const GRUPOS_REGRAS = [
  { titulo: 'Cobrança', hint: 'Grupo A · energia a custo, sem margem para o condomínio', itens: [
    { label: 'Tarifa por kWh', hint: 'Travada no início de cada sessão', valor: `R$ ${brl(TARIFA)}` },
    { label: 'Taxa de acesso mensal', hint: 'Por unidade com veículo vinculado', valor: `R$ ${brl(TAXA_ACESSO)}` },
    { label: 'Destino da cobrança', hint: 'Boleto condominial da unidade', valor: 'Rateio' }] },
  { titulo: 'Tolerância e ocupação', hint: 'Libera a vaga depois da recarga', itens: [
    { label: 'Tolerância após o fim', hint: 'Sem cobrança nesse intervalo', valor: '10 min' },
    { label: 'Taxa de ocupação', hint: 'Por minuto excedente', valor: 'R$ 0,25' },
    { label: 'Teto por sessão', hint: 'A partir daí o síndico é avisado', valor: 'R$ 30,00' }] },
  { titulo: 'Capacidade elétrica', hint: 'O balanceamento age antes do limite', itens: [
    { label: 'Limite contratado', hint: 'Demanda do prédio', valor: '75 kW' },
    { label: 'Reserva das áreas comuns', hint: 'Nunca entra no balanceamento', valor: '11,5 kW' },
    { label: 'Potência mínima por ponto', hint: 'Abaixo disso a sessão é pausada', valor: '3,7 kW' }] },
  { titulo: 'Uso', hint: 'Regras aprovadas em assembleia', itens: [
    { label: 'Limite por sessão', hint: 'Energia máxima liberada de uma vez', valor: '29 kWh' },
    { label: 'Reserva antecipada', hint: 'Fila no app, sem reserva de horário', valor: 'Desativada' },
    { label: 'Visitantes', hint: 'Ponto L2 · cobrança no cartão', valor: 'Grupo B' }] },
];

export const GRUPOS_CONFIG = [
  { titulo: 'Condomínio', hint: 'Dados usados no relatório e no app', itens: [
    { label: 'Razão social', hint: 'Residencial Aclimação', valor: 'CNPJ ••.•••.•••/0001-24' },
    { label: 'Endereço', hint: 'Rua Muniz de Sousa, 1120 · São Paulo', valor: '2 torres' },
    { label: 'Síndica responsável', hint: 'Recebe os avisos de fechamento', valor: 'Renata Coelho' }] },
  { titulo: 'Administradora', hint: 'Destino do CSV do rateio', itens: [
    { label: 'Empresa', hint: 'Importa o rateio no boleto', valor: 'Gestão Predial SP' },
    { label: 'E-mail do envio', hint: 'rateio@gestaopredialsp.com.br', valor: 'Mensal' },
    { label: 'Dia do fechamento', hint: 'Corte da medição do mês', valor: 'Dia 01' }] },
  { titulo: 'Relatório', hint: 'Formato aceito pelo importador de boletos', itens: [
    { label: 'Separador', hint: 'Ponto e vírgula', valor: ';' },
    { label: 'Decimal', hint: 'Padrão brasileiro', valor: 'Vírgula' },
    { label: 'Colunas', hint: 'unidade, kwh, energia, acesso, ocupação, total', valor: '6' }] },
  { titulo: 'Dados dos moradores', hint: 'LGPD · o portal vê o mínimo necessário', itens: [
    { label: 'CPF', hint: 'Sempre mascarado no portal', valor: 'Mascarado' },
    { label: 'Retenção da medição', hint: 'Depois disso, só o agregado do rateio', valor: '5 anos' },
    { label: 'Pedidos de exclusão', hint: 'Nenhum pedido em aberto', valor: '0' }] },
];

export const CAMPOS_MORADOR = [
  { label: 'Nome completo e CPF', hint: 'Identidade da unidade' },
  { label: 'Telefone', hint: 'Avisos da sessão' },
  { label: 'Placa e modelo do veículo', hint: 'Vincula a recarga' },
  { label: 'Consentimento LGPD', hint: 'Obrigatório' },
];
