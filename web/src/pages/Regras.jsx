import { PageTitle, GrupoLinhas } from '../components/ui';
import { GRUPOS_REGRAS } from '../data/portal';
import './pages.css';

export default function Regras() {
  return (
    <div className="stack">
      <PageTitle
        title="Regras e tarifas"
        sub="Mudanças valem para as sessões seguintes. As sessões já medidas mantêm a tarifa travada no início."
      />
      <div className="grid2">
        {GRUPOS_REGRAS.map((g) => <GrupoLinhas key={g.titulo} {...g} />)}
      </div>
    </div>
  );
}
