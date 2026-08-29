import { PageTitle, GrupoLinhas } from '../components/ui';
import { GRUPOS_CONFIG } from '../data/portal';
import './pages.css';

export default function Config() {
  return (
    <div className="stack">
      <PageTitle
        title="Configurações"
        sub="Dados do condomínio, destino do rateio e tratamento de dados dos moradores."
      />
      <div className="grid2">
        {GRUPOS_CONFIG.map((g) => <GrupoLinhas key={g.titulo} {...g} />)}
      </div>
    </div>
  );
}
