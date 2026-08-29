import { Card, PageTitle, Pill } from '../components/ui';
import { SESSOES, TARIFA, brl, num } from '../data/portal';
import './pages.css';

const COLUNAS = ['Sessão', 'Unidade', 'Ponto', 'Quando', 'kWh', 'Valor', 'Status'];

export default function Sessoes() {
  return (
    <div className="stack">
      <PageTitle
        title="Sessões de agosto"
        sub="Registro bruto da medição. Toda linha do rateio nasce daqui, incluindo sessões interrompidas com kWh parcial."
      />
      <Card flush>
        <div className="tableWrap">
          <div className="tableMin tableMin--sessoes">
            <div className="row row--head">
              {COLUNAS.map((c, i) => (
                <div key={c} className={`th ${i === 4 || i === 5 ? 'th--right' : ''}`}>{c}</div>
              ))}
            </div>
            {SESSOES.map((s) => (
              <div className="row row--body" key={s.id}>
                <div className="cell cell--mono cell--id">{s.id}</div>
                <div className="cell cell--mono cell--strong">{s.unidade}</div>
                <div className="cell cell__main">{s.ponto}</div>
                <div className="cell cell--mono cell--muted">{s.quando}</div>
                <div className="cell cell--mono cell--right">{num(s.kwh)}</div>
                <div className="cell cell--mono cell--right cell--strong">R$ {brl(s.kwh * TARIFA)}</div>
                <div className="cell"><Pill tom={s.tom}>{s.status}</Pill></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
