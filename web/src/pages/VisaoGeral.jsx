import { Card, SectionTitle, Metric, StatusPill, Meter, InfoBanner } from '../components/Primitives';
import {
  PONTOS, DEMANDA_SERIE, DEMANDA_CONTRATADA, THROTTLING, RATEIO,
  TARIFA, fmt, custoEnergia,
} from '../data/condominio';
import './pages.css';

const ESTADO = {
  carregando: { pill: 'charging', label: 'Carregando' },
  livre: { pill: 'available', label: 'Livre' },
  ocioso: { pill: 'idle', label: 'Ocioso' },
  falha: { pill: 'fault', label: 'Falha' },
};

export default function VisaoGeral() {
  // A leitura mais recente da série; bate com os pontos carregando × 7 kW.
  const demandaAgora = DEMANDA_SERIE[DEMANDA_SERIE.length - 1];
  const pico = Math.max(...DEMANDA_SERIE);
  const kwhMes = RATEIO.reduce((a, r) => a + r.kwh, 0);
  const carregando = PONTOS.filter((p) => p.estado === 'carregando').length;
  const emFalha = PONTOS.filter((p) => p.estado === 'falha').length;

  return (
    <div className="stack">
      <header className="page-head">
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Visão geral</h1>
            <p className="page-head__sub">Agosto de 2026 · leitura em tempo real do SEMS</p>
          </div>
        </div>
      </header>

      <div className="grid grid--4">
        <Card><Metric size="lg" value={fmt(kwhMes)} unit="kWh" label="Consumo do mês" /></Card>
        <Card><Metric size="lg" value={fmt(custoEnergia(kwhMes))} unit="R$" label="Energia a repassar" /></Card>
        <Card><Metric size="lg" value={`${carregando} / ${PONTOS.length}`} label="Pontos carregando" /></Card>
        <Card>
          <Metric size="lg" value={String(pico)} unit="kW" label="Pico de demanda" tone={pico > DEMANDA_CONTRATADA ? 'fault' : 'default'} />
        </Card>
      </div>

      <section>
        <SectionTitle action={`contratada ${DEMANDA_CONTRATADA} kW`}>Capacidade elétrica</SectionTitle>
        <Card>
          <div className="capacity">
            <div className="capacity__now">
              <Metric size="xl" value={String(demandaAgora)} unit="kW" label="Demanda instantânea" tone={demandaAgora >= DEMANDA_CONTRATADA * 0.8 ? 'demand' : 'default'} />
              <div className="capacity__meter">
                <Meter value={demandaAgora} max={DEMANDA_CONTRATADA + 5} tone="demand" threshold={DEMANDA_CONTRATADA} />
                <div className="capacity__legend">
                  <span>0 kW</span>
                  <span>marcador: demanda contratada</span>
                  <span>{DEMANDA_CONTRATADA + 5} kW</span>
                </div>
              </div>
            </div>

            <div className="chart" role="img" aria-label="Demanda das últimas 12 leituras">
              {DEMANDA_SERIE.map((v, i) => (
                <div className="chart__col" key={i}>
                  <div
                    className={`chart__bar ${v > DEMANDA_CONTRATADA ? 'chart__bar--over' : ''}`}
                    style={{ height: `${(v / (DEMANDA_CONTRATADA + 5)) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {THROTTLING.length ? (
        <InfoBanner tone="warning" title={`${THROTTLING.length} eventos de throttling neste mês`}>
          O balanceamento reduziu a potência entregue quando a demanda passou de {DEMANDA_CONTRATADA} kW.
          Nenhum morador foi cobrado a mais por isso — a sessão apenas leva mais tempo. Um aumento de
          demanda contratada eliminaria a espera nos horários de pico.
        </InfoBanner>
      ) : null}

      <div className="grid grid--2">
        <section>
          <SectionTitle action={`${emFalha ? '1 em falha' : 'todos operantes'}`}>Pontos de recarga</SectionTitle>
          <Card flush>
            <table className="table">
              <tbody>
                {PONTOS.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="table__strong">{p.nome}</div>
                      <div className="table__hint">
                        {p.unidade ? `Unidade ${p.unidade}` : 'Sem sessão'} · {fmt(p.potencia, 1)} kW
                      </div>
                    </td>
                    <td className="table__num tnum">{fmt(p.kwhMes)} kWh</td>
                    <td className="table__right">
                      <StatusPill status={ESTADO[p.estado].pill}>{ESTADO[p.estado].label}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <SectionTitle>Eventos de throttling</SectionTitle>
          <Card flush>
            <table className="table">
              <tbody>
                {THROTTLING.map((t, i) => (
                  <tr key={i}>
                    <td>
                      <div className="table__strong">{t.dia} · {t.hora}</div>
                      <div className="table__hint">{t.pontos} pontos simultâneos · {t.duracao}</div>
                    </td>
                    <td className="table__right table__num tnum">
                      <span className="over">{t.pico} kW</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="footnote">
            Energia repassada a custo de R$ {fmt(TARIFA)} por kWh, sem margem — ANEEL RN 1.000/2021.
          </p>
        </section>
      </div>
    </div>
  );
}
