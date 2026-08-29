import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildUnidades, calc } from '../data/portal';

const Ctx = createContext(null);

export function PortalProvider({ children }) {
  const [unidades, setUnidades] = useState(buildUnidades);
  const [busca, setBusca] = useState('');
  const [filtroRateio, setFiltroRateio] = useState('todas');
  const [filtroMoradores, setFiltroMoradores] = useState('todos');
  const [conviteAberto, setConviteAberto] = useState(false);
  const [exportado, setExportado] = useState(false);
  const [toast, setToast] = useState('');

  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  // Cada unidade já chega com energia, taxa, ocupação e total calculados.
  const comCalc = useMemo(() => unidades.map((u) => ({ ...u, ...calc(u) })), [unidades]);

  const totais = useMemo(() => {
    const soma = (k) => comCalc.reduce((a, u) => a + u[k], 0);
    const energia = soma('energia');
    const taxa = soma('taxa');
    const ocup = soma('ocup');
    return {
      kwh: soma('kwh'), energia, acesso: taxa, ocupacao: ocup,
      sessoes: soma('sessoes'), geral: energia + taxa + ocup,
      comConsumo: comCalc.filter((u) => u.kwh > 0).length,
      ativos: comCalc.filter((u) => u.status === 'ativo').length,
      pendentes: comCalc.filter((u) => u.status === 'pendente').length,
      vazios: comCalc.filter((u) => u.status === 'vazio').length,
      comOcupacao: comCalc.filter((u) => u.ocupMin > 0).length,
    };
  }, [comCalc]);

  /** Convidar reaproveita a unidade se ela já existir, em vez de duplicá-la. */
  const enviarConvite = useCallback((form) => {
    const alvo = `${form.torre} · ${form.unidade || '—'}`;
    setUnidades((lista) => {
      const existe = lista.some((u) => u.unidade === alvo);
      if (existe) {
        return lista.map((u) => (u.unidade === alvo
          ? { ...u, status: 'pendente', nome: 'Convite enviado', email: form.email || u.email }
          : u));
      }
      const nova = {
        id: `${form.torre}-${form.unidade || '00'}`, unidade: alvo,
        nome: 'Convite enviado', cpf: '—', email: form.email || '—', telefone: '—',
        placa: '—', modelo: '—', status: 'pendente', sessoes: 0, kwh: 0, ocupMin: 0,
      };
      return [nova, ...lista];
    });
    setConviteAberto(false);
    setBusca('');
    setFiltroMoradores('pendentes');
    flash(`Convite enviado para a unidade ${alvo}`);
  }, [flash]);

  const value = useMemo(() => ({
    unidades: comCalc, totais, busca, setBusca,
    filtroRateio, setFiltroRateio, filtroMoradores, setFiltroMoradores,
    conviteAberto, setConviteAberto, enviarConvite,
    exportado, setExportado, toast, flash,
  }), [comCalc, totais, busca, filtroRateio, filtroMoradores, conviteAberto,
    enviarConvite, exportado, toast, flash]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePortal = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePortal fora do PortalProvider');
  return v;
};
