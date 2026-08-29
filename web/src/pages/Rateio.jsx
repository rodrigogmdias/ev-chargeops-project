import { useMemo, useState } from 'react';
import { FileDown, Table2 } from 'lucide-react';
import { Card, SectionTitle, Metric, StatusPill, Button, InfoBanner } from '../components/Primitives';
import {
  RATEIO, TARIFA, TAXA_ACESSO, TAXA_OCUPACAO, fmt,
  custoEnergia, custoOcupacao, totalUnidade, CONDOMINIO,
} from '../data/condominio';
import './pages.css';

const MESES = [
  { value: 'agosto', label: 'Agosto de 2026', destino: 'boleto de setembro' },
  { value: 'julho', label: 'Julho de 2026', destino: 'boleto de agosto' },
];

/** Julho fechou com menos consumo; o protótipo escala o mês corrente. */
const escala = (mes) => (mes === 'julho' ? 0.78 : 1);

export default function Rateio() {
  const [mes, setMes] = useState('agosto');
  const [baixado, setBaixado] = useState('');

  const linhas = useMemo(
    () => RATEIO.map((r) => {
      const k = escala(mes);
      const kwh = r.kwh * k;
      const ocupacaoMin = mes === 'julho' ? 0 : r.ocupacaoMin;
      return { ...r, kwh, ocupacaoMin, sessoes: Math.max(1, Math.round(r.sessoes * k)) };
    }),
    [mes],
  );

  const totais = linhas.reduce(
    (a, r) => ({
      kwh: a.kwh + r.kwh,
      energia: a.energia + custoEnergia(r.kwh),
      ocupacao: a.ocupacao + custoOcupacao(r.ocupacaoMin),
      acesso: a.acesso + TAXA_ACESSO,
    }),
    { kwh: 0, energia: 0, ocupacao: 0, acesso: 0 },
  );
  const totalGeral = totais.energia + totais.ocupacao + totais.acesso;
  const mesAtual = MESES.find((m) => m.value === mes);

  // Exporta o mesmo fechamento que a tela mostra, para conferência.
  const baixar = (formato) => {
    const cab = ['Unidade', 'Torre', 'Morador', 'Sessoes', 'kWh', 'Energia', 'Ocupacao', 'Taxa de acesso', 'Total'];
    const linhasCsv = linhas.map((r) => [
      r.unidade, r.torre, r.morador, r.sessoes,
      fmt(r.kwh), fmt(custoEnergia(r.kwh)), fmt(custoOcupacao(r.ocupacaoMin)),
      fmt(TAXA_ACESSO), fmt(totalUnidade(r)),
    ]);
    const csv = [cab, ...linhasCsv].map((l) => l.join(';')).join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rateio-${mes}-2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setBaixado(formato);
    setTimeout(() => setBaixado(''), 2600);
  };

  return (
    <div className="stack">
      <header className="page-head">
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Rateio</h1>
            <p className="page-head__sub">
              {CONDOMINIO.nome} · fechamento vai para o {mesAtual.destino}
            </p>
          </div>
          <div className="page-head__actions">
            <Button variant="outline" icon={Table2} onClick={() => baixar('CSV')}>CSV</Button>
            <Button variant="outline" icon={FileDown} onClick={() => baixar('PDF')}>PDF</Button>
          </div>
        </div>
      </header>

      <div className="segmented">
        {MESES.map((m) => (
          <button
            key={m.value}
            type="button"
            className={`segmented__opt ${mes === m.value ? 'is-on' : ''}`}
            onClick={() => setMes(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {baixado ? (
        <InfoBanner tone="success" title={`Arquivo ${baixado} gerado`}>
          O arquivo traz as mesmas linhas desta tela, para conferência da administradora.
        </InfoBanner>
      ) : null}

      <div className="grid grid--4">
        <Card><Metric size="lg" value={fmt(totais.kwh)} unit="kWh" label="Consumo medido" /></Card>
        <Card><Metric size="lg" value={fmt(totais.energia)} unit="R$" label="Energia (a custo)" /></Card>
        <Card>
          <Metric size="lg" value={fmt(totais.ocupacao)} unit="R$" label="Taxa de ocupação"
            tone={totais.ocupacao > 0 ? 'fault' : 'default'} />
        </Card>
        <Card><Metric size="lg" value={fmt(totalGeral)} unit="R$" label="Total do fechamento" /></Card>
      </div>

      <section>
        <SectionTitle action={`${linhas.length} unidades com consumo`}>Fechamento por unidade</SectionTitle>
        <Card flush>
          <div className="scroll-x">
            <table className="table table--grid">
              <thead>
                <tr>
                  <th>Unidade</th>
                  <th>Morador</th>
                  <th className="table__right">Sessões</th>
                  <th className="table__right">kWh</th>
                  <th className="table__right">Energia</th>
                  <th className="table__right">Ocupação</th>
                  <th className="table__right">Acesso</th>
                  <th className="table__right">Total</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((r) => (
                  <tr key={r.unidade}>
                    <td>
                      <div className="table__strong">Unidade {r.unidade}</div>
                      <div className="table__hint">Torre {r.torre}</div>
                    </td>
                    <td>{r.morador}</td>
                    <td className="table__right tnum">{r.sessoes}</td>
                    <td className="table__right tnum">{fmt(r.kwh)}</td>
                    <td className="table__right tnum">{fmt(custoEnergia(r.kwh))}</td>
                    <td className="table__right tnum">
                      {r.ocupacaoMin > 0
                        ? <StatusPill status="fault">{fmt(custoOcupacao(r.ocupacaoMin))}</StatusPill>
                        : <span className="table__null">—</span>}
                    </td>
                    <td className="table__right tnum">{fmt(TAXA_ACESSO)}</td>
                    <td className="table__right tnum table__strong">{fmt(totalUnidade(r))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total</td>
                  <td className="table__right tnum">{fmt(totais.kwh)}</td>
                  <td className="table__right tnum">{fmt(totais.energia)}</td>
                  <td className="table__right tnum">{fmt(totais.ocupacao)}</td>
                  <td className="table__right tnum">{fmt(totais.acesso)}</td>
                  <td className="table__right tnum">{fmt(totalGeral)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </section>

      <InfoBanner tone="success" title="Grupo A · condomínio">
        Energia repassada a custo de R$ {fmt(TARIFA)} por kWh, sem margem — ANEEL RN 1.000/2021.
        A taxa de acesso de R$ {fmt(TAXA_ACESSO)} por unidade cobre a infraestrutura e foi definida em
        assembleia; a de ocupação, R$ {fmt(TAXA_OCUPACAO)} por minuto, só incide após 10 min de tolerância
        e sempre depois de um aviso ao morador.
      </InfoBanner>
    </div>
  );
}
