import React, { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect } from 'react';

// ── Domain data (from the design prototype) ─────────────────────────────
// Coordinates: Aclimação, São Paulo — the condominium garage + a nearby mall.
export const PONTOS = [
  {
    id: 'L1-01', nome: 'Garagem L1 · Vaga 12', local: 'Condomínio Aclimação · 40 m',
    tarifa: 0.89, pot: '7.00', fator: '0,8×', regime: 'A', livre: true,
    meta: '40 m · livre agora', preAut: 60,
    lat: -23.56905, lng: -46.63145,
  },
  {
    id: 'L1-02', nome: 'Garagem L1 · Vaga 13', local: 'Condomínio Aclimação · 42 m',
    tarifa: 0.89, pot: '7.00', fator: '1,0×', regime: 'A', livre: false,
    meta: '42 m · 1 na fila · ~35 min', preAut: 60,
    lat: -23.56928, lng: -46.63102,
  },
  {
    id: 'L2-01', nome: 'Garagem L2 · Visitantes', local: 'Condomínio Aclimação · 110 m',
    tarifa: 0.89, pot: '7.00', fator: '1,5×', regime: 'A', livre: true,
    meta: '110 m · horário disputado', preAut: 60,
    lat: -23.56990, lng: -46.63230,
  },
  {
    id: 'SH-03', nome: 'Shopping Aclimação · P3', local: 'Rede comercial · 1,2 km',
    tarifa: 1.89, pot: '22.0', fator: '1,3×', regime: 'B', livre: true,
    meta: '1,2 km · 4 de 6 livres', preAut: 90,
    lat: -23.57890, lng: -46.62620,
  },
];

export const USER_LOCATION = { lat: -23.56880, lng: -46.63175 };

export const CARTOES_INICIAIS = [
  { id: 'visa', rede: 'VISA', marca: '#1A1F71', numero: '•••• •••• •••• 4242', detalhe: 'Padrão · tokenizado no Stripe' },
  { id: 'master', rede: 'MC', marca: '#3D3D44', numero: '•••• •••• •••• 8817', detalhe: 'Expira 04/28' },
];

export const NOTIFS = [
  { icone: 'bell', tom: 'idle', titulo: 'Sua recarga termina em 15 minutos', texto: 'Garagem L1 · Vaga 12 · 16,4 kWh até agora.', hora: '22:05' },
  { icone: 'circle-check', tom: 'charging', titulo: 'Recarga concluída', texto: 'Você tem 10 min de tolerância antes da taxa de ocupação.', hora: '22:20' },
  { icone: 'triangle-alert', tom: 'fault', titulo: 'Multa de ocupação iniciada', texto: 'R$ 0,25 por minuto excedente a partir de agora.', hora: '22:30' },
  { icone: 'plug', tom: 'fault', titulo: 'Sessão interrompida', texto: 'O cabo foi desconectado em 21/08. Registramos 4,05 kWh parciais.', hora: '21/08' },
  { icone: 'receipt', tom: 'info', titulo: 'Extrato de agosto disponível', texto: 'Total de 66,21 kWh no boleto condominial da unidade 42.', hora: '01/09' },
];

export const CONSENT = [
  { id: 'identidade', icone: 'circle-user', label: 'Identidade e unidade', hint: 'Obrigatório · vincula a sessão ao boleto da unidade', fixo: true },
  { id: 'telemetria', icone: 'gauge', label: 'Telemetria da recarga', hint: 'Obrigatório · kWh medido, base da cobrança', fixo: true },
  { id: 'localizacao', icone: 'map-pin', label: 'Localização', hint: 'Só com o app aberto, para ordenar os pontos próximos' },
  { id: 'marketing', icone: 'bell', label: 'Novidades do produto', hint: 'Comunicados sobre novas funções' },
];

/** Folga da bateria do veículo simulado: 42% → 100% ≈ 29 kWh. */
export const CAP = 29;

export const HISTORICO = {
  agosto: {
    destino: 'Total no boleto de setembro',
    qtd: '5 sessões',
    barras: [{ label: 'S1', v: 11.8 }, { label: 'S2', v: 18.2 }, { label: 'S3', v: 4.1 }, { label: 'S4', v: 22.4 }, { label: 'S5', v: 9.8 }],
    sessoes: [
      { d: '25/08 · 22:20', kwh: 11.76, valor: 10.47, tom: 'charging', st: 'Concluída' },
      { d: '23/08 · 07:42', kwh: 18.20, valor: 16.20, tom: 'charging', st: 'Concluída' },
      { d: '21/08 · 19:05', kwh: 4.05, valor: 3.60, tom: 'fault', st: 'Interrompida · kWh parcial' },
      { d: '19/08 · 21:30', kwh: 22.40, valor: 19.94, tom: 'charging', st: 'Concluída' },
      { d: '17/08 · 08:14', kwh: 9.80, valor: 10.22, tom: 'idle', st: 'Ocupação de 6 min · R$ 1,50' },
    ],
  },
  julho: {
    destino: 'Total no boleto de agosto',
    qtd: '4 sessões',
    barras: [{ label: 'S1', v: 14.2 }, { label: 'S2', v: 8.6 }, { label: 'S3', v: 20.1 }, { label: 'S4', v: 12.9 }, { label: 'S5', v: 0 }],
    sessoes: [
      { d: '29/07 · 20:11', kwh: 12.90, valor: 11.48, tom: 'charging', st: 'Concluída' },
      { d: '24/07 · 06:58', kwh: 20.10, valor: 17.89, tom: 'charging', st: 'Concluída' },
      { d: '16/07 · 22:47', kwh: 8.60, valor: 7.65, tom: 'charging', st: 'Concluída' },
      { d: '09/07 · 18:20', kwh: 14.20, valor: 12.64, tom: 'charging', st: 'Concluída' },
    ],
  },
};

export const PASSOS = [
  { label: 'Cartão autorizado', hint: 'Pré-bloqueio confirmado pelo banco' },
  { label: 'Ponto reservado para você', hint: 'Sessão vinculada à unidade 42' },
  { label: 'Comando enviado ao carregador', hint: 'SEMS Remote Control' },
  { label: 'Carregador liberado', hint: 'Conecte e a medição começa' },
];

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [torre, setTorre] = useState('B');
  const [unidade, setUnidade] = useState('42');
  const [placa, setPlaca] = useState('');
  const [consent, setConsent] = useState({ localizacao: true, marketing: false });

  const [pontoId, setPontoId] = useState('L1-01');
  const [filtro, setFiltro] = useState('todos');

  const [cartaoId, setCartaoId] = useState('visa');
  const [cartoes, setCartoes] = useState(CARTOES_INICIAIS);

  // Limite da recarga: 'cheia' (sem limite) | 'valor' (R$) | 'energia' (kWh)
  const [limModo, setLimModo] = useState('cheia');
  const [limValor, setLimValor] = useState(20);
  const [limKwh, setLimKwh] = useState(10);

  const [mes, setMes] = useState('agosto');

  // phase: idle | liberando | sessao | tolerancia | encerrada
  const [sessao, setSessao] = useState({
    phase: 'idle', passo: 0, kwh: 0, secs: 0, soc: 42, demanda: 22,
    throttling: false, tol: 600, multaSecs: 0,
  });

  const [toast, setToast] = useState('');

  const timers = useRef({});
  const stop = useCallback(() => {
    Object.values(timers.current).forEach(clearInterval);
    timers.current = {};
  }, []);
  useEffect(() => stop, [stop]);

  const toastTimer = useRef(null);
  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  const ponto = PONTOS.find((p) => p.id === pontoId) || PONTOS[0];

  // Teto em R$ arredondado para baixo em múltiplos de 5, para os presets.
  const maxValor = Math.floor((CAP * ponto.tarifa) / 5) * 5;

  // Quanta energia o limite escolhido libera, em kWh.
  const limiteKwh =
    limModo === 'valor' ? Math.min(limValor, maxValor) / ponto.tarifa
      : limModo === 'energia' ? Math.min(limKwh, CAP)
        : CAP;

  const meta = Math.min(CAP, limiteKwh);

  // Grupo A não bloqueia cartão; no B a pré-autorização segue o limite (+5%).
  const preAut = limModo === 'cheia' ? ponto.preAut : Math.max(20, Math.ceil(limiteKwh * ponto.tarifa * 1.05));

  const encerrarRef = useRef(null);

  const iniciarSessao = useCallback(() => {
    stop();
    setSessao({ phase: 'sessao', passo: 4, kwh: 0, secs: 0, soc: 42, demanda: 22, throttling: false, tol: 600, multaSecs: 0 });
    let fim = false;
    timers.current.tick = setInterval(() => {
      setSessao((s) => {
        if (s.phase !== 'sessao') return s;
        const throttling = s.secs > 26 && s.secs < 70;
        const kw = throttling ? 4.5 : 7.4;
        const kwh = Math.min(meta, s.kwh + kw * 0.0125);
        const soc = Math.min(100, 42 + kwh * 2);
        // Atingiu o limite: a sessão se encerra sozinha e cai na tolerância.
        if (kwh >= meta - 0.0001 && !fim) {
          fim = true;
          clearInterval(timers.current.tick);
          setTimeout(() => encerrarRef.current && encerrarRef.current(), 700);
        }
        return { ...s, kwh, soc, secs: s.secs + 1, throttling, demanda: throttling ? 44 : 29 };
      });
    }, 250);
  }, [stop, meta]);

  const iniciarLiberacao = useCallback(() => {
    stop();
    setSessao((s) => ({ ...s, phase: 'liberando', passo: 0, kwh: 0, secs: 0, throttling: false, tol: 600, multaSecs: 0 }));
    timers.current.lib = setInterval(() => {
      setSessao((s) => {
        if (s.passo >= 4) return s;
        return { ...s, passo: s.passo + 1 };
      });
    }, 850);
  }, [stop]);

  const encerrar = useCallback(() => {
    stop();
    setSessao((s) => ({ ...s, phase: 'tolerancia', tol: 600, multaSecs: 0 }));
    timers.current.tol = setInterval(() => {
      setSessao((s) => {
        if (s.phase !== 'tolerancia') return s;
        return s.tol > 0
          ? { ...s, tol: Math.max(0, s.tol - 20) }
          : { ...s, multaSecs: s.multaSecs + 20 };
      });
    }, 900);
  }, [stop]);

  // A sessão precisa chamar `encerrar` sem recriar o timer a cada render.
  useEffect(() => { encerrarRef.current = encerrar; }, [encerrar]);

  const pularTolerancia = useCallback(() => {
    setSessao((s) => (s.tol > 0 ? { ...s, tol: 0 } : { ...s, multaSecs: s.multaSecs + 300 }));
  }, []);

  const fecharSessao = useCallback(() => {
    stop();
    setSessao((s) => ({ ...s, phase: 'encerrada' }));
  }, [stop]);

  const resetSessao = useCallback(() => {
    stop();
    setSessao({ phase: 'idle', passo: 0, kwh: 0, secs: 0, soc: 42, demanda: 22, throttling: false, tol: 600, multaSecs: 0 });
  }, [stop]);

  const adicionarCartao = useCallback((ultimos4) => {
    const novo = {
      id: 'novo', rede: 'NOVO', marca: '#E8121F',
      numero: '•••• •••• •••• ' + (ultimos4 || '0000'),
      detalhe: 'Recém-adicionado',
    };
    setCartoes((cs) => [...cs.filter((c) => c.id !== 'novo'), novo]);
    setCartaoId('novo');
  }, []);

  const value = useMemo(() => ({
    email, setEmail, senha, setSenha, codigo, setCodigo,
    torre, setTorre, unidade, setUnidade, placa, setPlaca,
    consent, setConsent,
    pontoId, setPontoId, filtro, setFiltro, ponto,
    cartaoId, setCartaoId, cartoes, adicionarCartao,
    limModo, setLimModo, limValor, setLimValor, limKwh, setLimKwh,
    maxValor, limiteKwh, meta, preAut,
    mes, setMes,
    sessao, iniciarLiberacao, iniciarSessao, encerrar, pularTolerancia, fecharSessao, resetSessao,
    toast, flash,
  }), [email, senha, codigo, torre, unidade, placa, consent, pontoId, filtro, ponto,
    cartaoId, cartoes, adicionarCartao, limModo, limValor, limKwh,
    maxValor, limiteKwh, meta, preAut, mes,
    sessao, iniciarLiberacao, iniciarSessao,
    encerrar, pularTolerancia, fecharSessao, resetSessao, toast, flash]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp fora do AppStateProvider');
  return ctx;
};
