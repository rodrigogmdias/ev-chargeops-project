import { Card, Kpi, PageTitle, Pill } from '../components/ui';
import { PONTOS, DEMANDA_AGORA, LIMITE_CONTRATADO, RESERVA_COMUM, num } from '../data/portal';
import './pages.css';

export default function Pontos() {
  return (
    <div className="stack">
      <PageTitle
        title="Pontos e capacidade elétrica"
        sub="Três pontos no condomínio, todos no Grupo A. A demanda somada nunca passa do limite contratado porque o balanceamento reduz a potência antes."
      />

      <Card className="capCard">
        <div className="cap__row">
          <span className="cardHead__title">Demanda agora</span>
          <span className="cap__valor">{num(DEMANDA_AGORA, 1)} de {LIMITE_CONTRATADO} kW</span>
        </div>
        <div className="meter">
          <div className="meter__fill meter__fill--demand"
            style={{ width: `${Math.round((DEMANDA_AGORA / LIMITE_CONTRATADO) * 100)}%` }} />
        </div>
        <div className="grid3 capKpis">
          <div className="capKpi">
            <div className="capKpi__pair">
              <span className="kpi__value kpi__value--demand">{num(DEMANDA_AGORA, 1)}</span>
              <span className="kpi__unit">kW agora</span>
            </div>
            <div className="kpi__hint">Soma dos pontos em uso</div>
          </div>
          <div className="capKpi">
            <div className="capKpi__pair">
              <span className="kpi__value">{LIMITE_CONTRATADO}</span>
              <span className="kpi__unit">kW</span>
            </div>
            <div className="kpi__hint">Limite contratado do prédio</div>
          </div>
          <div className="capKpi">
            <div className="capKpi__pair">
              <span className="kpi__value">{num(RESERVA_COMUM, 1)}</span>
              <span className="kpi__unit">kW</span>
            </div>
            <div className="kpi__hint">Reservado para as áreas comuns</div>
          </div>
        </div>
      </Card>

      <div className="grid3">
        {PONTOS.map((p) => (
          <Card key={p.id} className="pontoCard">
            <div className="pontoCard__head">
              <div>
                <div className="pontoCard__nome">{p.nome}</div>
                <div className="pontoCard__id">{p.id}</div>
              </div>
              <Pill tom={p.tom}>{p.status}</Pill>
            </div>
            <div className="hairline" />
            <div className="pontoCard__linhas">
              {p.linhas.map((l) => (
                <div className="pontoCard__linha" key={l.label}>
                  <span className="pontoCard__label">{l.label}</span>
                  <span className="pontoCard__valor">{l.valor}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
