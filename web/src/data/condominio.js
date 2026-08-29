/** Tarifa da concessionária repassada a custo — Grupo A, sem margem. */
export const TARIFA = 0.89;
/** Taxa de acesso mensal por unidade, definida em assembleia. */
export const TAXA_ACESSO = 35.0;
/** Taxa de ocupação por minuto excedente, após 10 min de tolerância. */
export const TAXA_OCUPACAO = 0.25;
/** Demanda contratada do condomínio, em kW. */
export const DEMANDA_CONTRATADA = 45;

export const CONDOMINIO = {
  nome: 'Condomínio Aclimação',
  cnpj: '12.345.678/0001-90',
  administradora: 'Aclimação Administração',
  unidades: 84,
};

export const PONTOS = [
  { id: 'L1-01', nome: 'Garagem L1 · Vaga 12', potencia: 7.0, estado: 'carregando', unidade: '42', kwhMes: 66.21 },
  { id: 'L1-02', nome: 'Garagem L1 · Vaga 13', potencia: 7.0, estado: 'carregando', unidade: '17', kwhMes: 48.90 },
  { id: 'L2-01', nome: 'Garagem L2 · Visitantes', potencia: 7.0, estado: 'livre', unidade: null, kwhMes: 22.40 },
  { id: 'L2-02', nome: 'Garagem L2 · Vaga 31', potencia: 7.0, estado: 'ocioso', unidade: '61', kwhMes: 31.05 },
  { id: 'L2-03', nome: 'Garagem L2 · Vaga 32', potencia: 7.0, estado: 'falha', unidade: null, kwhMes: 0 },
];

/** Demanda instantânea das últimas 12 leituras, em kW. */
export const DEMANDA_SERIE = [12, 18, 22, 29, 31, 44, 46, 38, 29, 24, 19, 14];

/** Eventos em que o balanceamento reduziu a potência entregue. */
export const THROTTLING = [
  { dia: '25/08', hora: '21:40', pico: 46, duracao: '22 min', pontos: 3 },
  { dia: '23/08', hora: '19:05', pico: 45, duracao: '8 min', pontos: 3 },
  { dia: '19/08', hora: '20:12', pico: 47, duracao: '35 min', pontos: 4 },
];

/** Consumo por unidade no mês corrente — a base do rateio. */
export const RATEIO = [
  { unidade: '42', torre: 'B', morador: 'Rodrigo Dias', kwh: 66.21, ocupacaoMin: 6, sessoes: 5 },
  { unidade: '17', torre: 'A', morador: 'Carla Menezes', kwh: 48.90, ocupacaoMin: 0, sessoes: 4 },
  { unidade: '61', torre: 'B', morador: 'Eduardo Salles', kwh: 31.05, ocupacaoMin: 14, sessoes: 3 },
  { unidade: '08', torre: 'A', morador: 'Marina Prado', kwh: 22.40, ocupacaoMin: 0, sessoes: 2 },
  { unidade: '55', torre: 'C', morador: 'Júlia Ferraz', kwh: 18.75, ocupacaoMin: 0, sessoes: 2 },
  { unidade: '23', torre: 'A', morador: 'Otávio Lins', kwh: 9.80, ocupacaoMin: 3, sessoes: 1 },
];

export const MORADORES = [
  { id: 1, nome: 'Rodrigo Dias', unidade: '42', torre: 'B', email: 'rodrigo@aclimacao.com.br', placa: 'FKD2C19', estado: 'ativo', desde: '18/02/2026' },
  { id: 2, nome: 'Carla Menezes', unidade: '17', torre: 'A', email: 'carla.menezes@gmail.com', placa: 'RTA8H07', estado: 'ativo', desde: '02/03/2026' },
  { id: 3, nome: 'Eduardo Salles', unidade: '61', torre: 'B', email: 'esalles@outlook.com', placa: 'PQW4J55', estado: 'ativo', desde: '11/03/2026' },
  { id: 4, nome: 'Marina Prado', unidade: '08', torre: 'A', email: 'marina.prado@gmail.com', placa: '', estado: 'ativo', desde: '27/04/2026' },
  { id: 5, nome: 'Júlia Ferraz', unidade: '55', torre: 'C', email: 'ju.ferraz@gmail.com', placa: 'LMB9K21', estado: 'ativo', desde: '05/06/2026' },
  { id: 6, nome: 'Otávio Lins', unidade: '23', torre: 'A', email: 'otavio.lins@gmail.com', placa: '', estado: 'convidado', desde: '14/08/2026' },
];

export const fmt = (n, d = 2) =>
  Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Energia + ocupação; a taxa de acesso entra por unidade no fechamento. */
export const custoEnergia = (kwh) => kwh * TARIFA;
export const custoOcupacao = (min) => min * TAXA_OCUPACAO;
export const totalUnidade = (r) => custoEnergia(r.kwh) + custoOcupacao(r.ocupacaoMin) + TAXA_ACESSO;
