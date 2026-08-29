import { useMemo } from 'react';
import { FileText, FileDown, Info } from 'lucide-react';
import { Card, Kpi, PageTitle, Pill, Button, Busca, Filtros } from '../components/ui';
import { usePortal } from '../state/PortalState';
import { TARIFA, TAXA_ACESSO, MES_REFERENCIA, brl, num } from '../data/portal';
import './pages.css';

const COLUNAS = ['Unidade', 'Morador', 'Sess.', 'kWh', 'Energia', 'Acesso', 'Ocupação', 'Total'];
const FILTROS = [
  { value: 'todas', label: 'Todas' },
  { value: 'consumo', label: 'Com consumo' },
  { value: 'ocupacao', label: 'Com ocupação' },
];

export default function Rateio() {
  const {
    unidades, totais, busca, setBusca, filtroRateio, setFiltroRateio,
    exportado, setExportado, flash,
  } = usePortal();

  // Ordenadas pelo valor: a conversa com a administradora começa pelo maior.
  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return unidades
      .filter((u) => (filtroRateio === 'consumo' ? u.kwh > 0 : filtroRateio === 'ocupacao' ? u.ocupMin > 0 : true))
      .filter((u) => (q ? `${u.unidade} ${u.nome}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.total - a.total);
  }, [unidades, busca, filtroRateio]);

  const csv = useMemo(() => ['unidade;kwh;energia;acesso;ocupacao;total']
    .concat(linhas.slice(0, 3).map((u) =>
      [u.id, num(u.kwh), num(u.energia), num(u.taxa), num(u.ocup), num(u.total)].join(';')))
    .join('\n'), [linhas]);

  const exportar = () => {
    const conteudo = ['unidade;kwh;energia;acesso;ocupacao;total']
      .concat(unidades.map((u) =>
        [u.id, num(u.kwh), num(u.energia), num(u.taxa), num(u.ocup), num(u.total)].join(';')))
      .join('\n');
    const blob = new Blob([`﻿${conteudo}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rateio-agosto-2026.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportado(true);
    flash(`CSV de ${MES_REFERENCIA} gerado — ${unidades.length} linhas`);
  };

  return (
    <div className="stack">
      <PageTitle
        title={`Rateio de ${MES_REFERENCIA}`}
        tag={<Pill tom="idle">Em aberto · fecha em 01/09</Pill>}
        sub="Energia a custo, sem margem. Medição do SEMS consolidada por unidade, com a tarifa travada no início de cada sessão."
      >
        <Button variant="outline" icon={FileText}>Prévia por unidade</Button>
        <Button icon={FileDown} onClick={exportar}>{exportado ? 'CSV gerado' : 'Exportar CSV'}</Button>
      </PageTitle>

      <div className="grid4">
        <Kpi eyebrow="Total a ratear" value={`R$ ${brl(totais.geral)}`}
          hint={`${totais.comConsumo} unidades com consumo em ${MES_REFERENCIA}`} />
        <Kpi eyebrow="Energia medida" value={num(totais.kwh, 1)} unit="kWh"
          hint={`R$ ${brl(totais.energia)} a R$ ${brl(TARIFA)} por kWh`} />
        <Kpi eyebrow="Taxa de acesso" value={`R$ ${brl(totais.acesso)}`}
          hint={`${totais.ativos} unidades × R$ ${brl(TAXA_ACESSO)}`} />
        <Kpi eyebrow="Ocupação" value={`R$ ${brl(totais.ocupacao)}`} tone="demand"
          hint={`${totais.comOcupacao} unidades com minutos excedentes`} />
      </div>

      <Card flush>
        <div className="tableHead">
          <div className="tableHead__left">
            <span className="cardHead__title">Unidades</span>
            <span className="cardHead__hint">{linhas.length} de 40 · ordenadas pelo valor</span>
          </div>
          <div className="tableHead__right">
            <Busca placeholder="Unidade ou morador" value={busca} onChange={setBusca} />
            <Filtros opcoes={FILTROS} valor={filtroRateio} onChange={setFiltroRateio} />
          </div>
        </div>

        <div className="tableWrap">
          <div className="tableMin tableMin--rateio">
            <div className="row row--head">
              {COLUNAS.map((c, i) => (
                <div key={c} className={`th ${i >= 2 ? 'th--right' : ''}`}>{c}</div>
              ))}
            </div>

            {linhas.map((u) => (
              <div className="row row--body" key={u.id}>
                <div className="cell cell--mono cell--strong">{u.unidade}</div>
                <div className="cell cell--stack">
                  <div className="cell__main">{u.nome}</div>
                  <div className="cell__hint">
                    {u.status === 'ativo' ? `${u.placa} · ${u.modelo}` : 'Sem veículo vinculado'}
                  </div>
                </div>
                <div className="cell cell--mono cell--right cell--muted">{u.sessoes || '—'}</div>
                <div className="cell cell--mono cell--right">{u.kwh ? num(u.kwh) : '—'}</div>
                <div className="cell cell--mono cell--right">{u.energia ? `R$ ${brl(u.energia)}` : '—'}</div>
                <div className="cell cell--mono cell--right cell--muted">{u.taxa ? `R$ ${brl(u.taxa)}` : '—'}</div>
                <div className={`cell cell--mono cell--right ${u.ocup ? 'cell--fault' : 'cell--null'}`}>
                  {u.ocup ? `R$ ${brl(u.ocup)}` : '—'}
                </div>
                <div className="cell cell--mono cell--right cell--strong">R$ {brl(u.total)}</div>
              </div>
            ))}

            <div className="row row--total">
              <div className="th th--span2">Total a ratear</div>
              <div className="cell cell--mono cell--right cell--muted cell--strong">{totais.sessoes}</div>
              <div className="cell cell--mono cell--right cell--strong">{num(totais.kwh, 1)}</div>
              <div className="cell cell--mono cell--right cell--strong">R$ {brl(totais.energia)}</div>
              <div className="cell cell--mono cell--right cell--strong">R$ {brl(totais.acesso)}</div>
              <div className="cell cell--mono cell--right cell--strong cell--fault">R$ {brl(totais.ocupacao)}</div>
              <div className="cell cell--mono cell--right cell--total">R$ {brl(totais.geral)}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid2">
        <Card flush>
          <div className="cardHead"><div className="cardHead__title">Como o valor de cada unidade é formado</div></div>
          {[
            { label: 'Energia medida', hint: 'kWh do medidor × tarifa travada no início da sessão. Energia a custo, sem margem.', valor: `R$ ${brl(TARIFA)} / kWh` },
            { label: 'Taxa de acesso', hint: 'Rateio da infraestrutura do ponto, cobrada de quem tem veículo vinculado.', valor: `R$ ${brl(TAXA_ACESSO)} / mês` },
            { label: 'Taxa de ocupação', hint: 'Só depois dos 10 minutos de tolerância, por minuto excedente.', valor: 'R$ 0,25 / min' },
          ].map((c) => (
            <div className="compRow" key={c.label}>
              <div className="compRow__label">
                <div className="compRow__main">{c.label}</div>
                <div className="compRow__hint">{c.hint}</div>
              </div>
              <div className="compRow__valor">{c.valor}</div>
            </div>
          ))}
        </Card>

        <div className="csvCard">
          <div className="csvCard__head">
            <Info size={18} strokeWidth={2} className="csvCard__icon" />
            <div>
              <div className="csvCard__title">O CSV vai para a administradora</div>
              <p className="csvCard__body">
                Uma linha por unidade, com kWh, energia, taxa de acesso, ocupação e total. Layout
                fixo, ponto e vírgula como separador, decimal com vírgula — o mesmo aceito no
                importador de boletos.
              </p>
            </div>
          </div>
          <pre className="csvCard__sample">{csv}</pre>
          <p className="csvCard__foot">
            O fechamento é irreversível: depois de 01/09 as sessões de agosto não mudam mais e o mês
            seguinte começa a acumular.
          </p>
        </div>
      </div>
    </div>
  );
}
