import { useMemo } from 'react';
import { MailPlus, ChevronRight } from 'lucide-react';
import { Card, Kpi, PageTitle, Pill, Button, Busca, Filtros } from '../components/ui';
import { usePortal } from '../state/PortalState';
import { STATUS_LABEL, STATUS_TOM } from '../data/portal';
import './pages.css';

const COLUNAS = ['Unidade', 'Morador · CPF', 'Contato', 'Veículo', 'Status', ''];
const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativos', label: 'Ativos' },
  { value: 'pendentes', label: 'Pendentes' },
  { value: 'sem', label: 'Sem cadastro' },
];

export default function Moradores() {
  const {
    unidades, totais, busca, setBusca,
    filtroMoradores, setFiltroMoradores, setConviteAberto,
  } = usePortal();

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const porStatus = { ativos: 'ativo', pendentes: 'pendente', sem: 'vazio' }[filtroMoradores];
    return unidades
      .filter((u) => (porStatus ? u.status === porStatus : true))
      .filter((u) => (q ? `${u.unidade} ${u.nome} ${u.placa}`.toLowerCase().includes(q) : true));
  }, [unidades, busca, filtroMoradores]);

  return (
    <div className="stack">
      <PageTitle
        title="Moradores e unidades"
        sub="O convite vincula a unidade ao morador. Nome, CPF, telefone e veículo são preenchidos por ele no app, sob consentimento LGPD."
      >
        <Button icon={MailPlus} onClick={() => setConviteAberto(true)}>Convidar morador</Button>
      </PageTitle>

      <div className="grid4">
        <Kpi eyebrow="Unidades" value="40" hint="20 na torre A · 20 na torre B" />
        <Kpi eyebrow="Moradores ativos" value={String(totais.ativos)} tone="charging"
          hint="Cadastro completo e consentimento aceito" />
        <Kpi eyebrow="Convites pendentes" value={String(totais.pendentes)} tone="demand"
          hint="Aguardando o morador completar no app" />
        <Kpi eyebrow="Sem cadastro" value={String(totais.vazios)} tone="fault"
          hint="Sessões dessas unidades ficam fora do rateio" />
      </div>

      <Card flush>
        <div className="tableHead">
          <div className="tableHead__left">
            <span className="cardHead__title">Cadastro</span>
            <span className="cardHead__hint">{linhas.length} de 40</span>
          </div>
          <div className="tableHead__right">
            <Busca placeholder="Unidade, morador ou placa" value={busca} onChange={setBusca} width={190} />
            <Filtros opcoes={FILTROS} valor={filtroMoradores} onChange={setFiltroMoradores} />
          </div>
        </div>

        <div className="tableWrap">
          <div className="tableMin tableMin--moradores">
            <div className="row row--head">
              {COLUNAS.map((c, i) => <div key={c || i} className="th">{c}</div>)}
            </div>

            {linhas.map((u) => (
              <div className="row row--body" key={u.id}>
                <div className="cell cell--mono cell--strong cell--titulo">{u.unidade}</div>
                <div className="cell cell--stack cell--titulo">
                  <div className="cell__main">{u.nome}</div>
                  <div className="cell__hint cell__hint--mono">{u.cpf}</div>
                </div>
                <div className="cell cell--stack" data-label="Contato">
                  <div className="cell__main cell__main--muted">{u.email}</div>
                  <div className="cell__hint cell__hint--mono">{u.telefone}</div>
                </div>
                <div className="cell cell--stack" data-label="Veículo">
                  <div className="cell__main cell__main--mono">{u.placa}</div>
                  <div className="cell__hint">{u.modelo}</div>
                </div>
                <div className="cell" data-label="Status"><Pill tom={STATUS_TOM[u.status]}>{STATUS_LABEL[u.status]}</Pill></div>
                <button type="button" className="rowAction" aria-label={`Abrir unidade ${u.unidade}`}>
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            ))}

            {!linhas.length ? (
              <div className="vazio">
                <div className="vazio__title">Nenhuma unidade</div>
                <div className="vazio__hint">Por favor, ajuste a busca ou o filtro</div>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
