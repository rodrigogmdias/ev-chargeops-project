import { useMemo, useState } from 'react';
import { UserPlus, Search, X } from 'lucide-react';
import { Card, SectionTitle, Metric, StatusPill, Button, Field, InfoBanner } from '../components/Primitives';
import { MORADORES, fmt, RATEIO } from '../data/condominio';
import './pages.css';

const vazio = { nome: '', unidade: '', torre: '', email: '', placa: '' };

export default function Moradores() {
  const [lista, setLista] = useState(MORADORES);
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(vazio);
  const [erros, setErros] = useState({});
  const [toast, setToast] = useState('');

  const filtrada = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((m) =>
      [m.nome, m.unidade, m.torre, m.email, m.placa].join(' ').toLowerCase().includes(q));
  }, [lista, busca]);

  const consumo = (unidade) => RATEIO.find((r) => r.unidade === unidade)?.kwh ?? 0;

  const validar = () => {
    const e = {};
    if (form.nome.trim().length < 3) e.nome = 'Informe o nome completo';
    if (!form.unidade.trim()) e.unidade = 'Obrigatório para o rateio';
    if (!form.torre.trim()) e.torre = 'Obrigatório';
    if (!/.+@.+\..+/.test(form.email)) e.email = 'Email inválido';
    // O vínculo unidade+torre é o que leva o consumo ao boleto certo.
    const dup = lista.some((m) =>
      m.unidade === form.unidade.trim() && m.torre.toUpperCase() === form.torre.trim().toUpperCase());
    if (!e.unidade && !e.torre && dup) e.unidade = 'Já existe morador nesta unidade';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const salvar = (ev) => {
    ev.preventDefault();
    if (!validar()) return;
    const novo = {
      id: Date.now(),
      nome: form.nome.trim(),
      unidade: form.unidade.trim(),
      torre: form.torre.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      placa: form.placa.trim().toUpperCase(),
      estado: 'convidado',
      desde: new Date().toLocaleDateString('pt-BR'),
    };
    setLista((l) => [novo, ...l]);
    setForm(vazio);
    setErros({});
    setAberto(false);
    setToast(`Convite enviado para ${novo.email}`);
    setTimeout(() => setToast(''), 3200);
  };

  const set = (campo) => (ev) => setForm((f) => ({ ...f, [campo]: ev.target.value }));

  const ativos = lista.filter((m) => m.estado === 'ativo').length;

  return (
    <div className="stack">
      <header className="page-head">
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Moradores</h1>
            <p className="page-head__sub">
              O vínculo com a unidade é o que leva o consumo ao boleto certo
            </p>
          </div>
          <div className="page-head__actions">
            <Button icon={UserPlus} onClick={() => setAberto(true)}>Cadastrar morador</Button>
          </div>
        </div>
      </header>

      {toast ? <InfoBanner tone="success" title="Morador cadastrado">{toast}</InfoBanner> : null}

      <div className="grid grid--4">
        <Card><Metric size="lg" value={String(lista.length)} label="Cadastrados" /></Card>
        <Card><Metric size="lg" value={String(ativos)} label="Ativos" /></Card>
        <Card><Metric size="lg" value={String(lista.length - ativos)} label="Convites pendentes" /></Card>
        <Card><Metric size="lg" value={String(lista.filter((m) => m.placa).length)} label="Com placa" /></Card>
      </div>

      <section>
        <SectionTitle action={`${filtrada.length} de ${lista.length}`}>Cadastro</SectionTitle>

        <div className="search">
          <Search size={17} strokeWidth={2} />
          <input
            className="search__input"
            placeholder="Nome, unidade, torre, email ou placa"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <Card flush>
          <div className="scroll-x">
            <table className="table table--grid">
              <thead>
                <tr>
                  <th>Morador</th>
                  <th>Unidade</th>
                  <th>Email</th>
                  <th>Placa</th>
                  <th className="table__right">Consumo do mês</th>
                  <th className="table__right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtrada.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="table__strong">{m.nome}</div>
                      <div className="table__hint">desde {m.desde}</div>
                    </td>
                    <td className="tnum">{m.unidade} · Torre {m.torre}</td>
                    <td className="table__hint">{m.email}</td>
                    <td className="tnum">{m.placa || <span className="table__null">—</span>}</td>
                    <td className="table__right tnum">
                      {consumo(m.unidade) ? `${fmt(consumo(m.unidade))} kWh` : <span className="table__null">—</span>}
                    </td>
                    <td className="table__right">
                      <StatusPill status={m.estado === 'ativo' ? 'charging' : 'idle'}>
                        {m.estado === 'ativo' ? 'Ativo' : 'Convite enviado'}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
                {!filtrada.length ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty">
                        <div className="empty__title">Nenhum morador</div>
                        <div className="empty__hint">Por favor, ajuste a busca</div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {aberto ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Cadastrar morador">
          <div className="modal__scrim" onClick={() => setAberto(false)} />
          <form className="modal__panel" onSubmit={salvar}>
            <div className="modal__head">
              <h2 className="modal__title">Cadastrar morador</h2>
              <button type="button" className="modal__close" onClick={() => setAberto(false)} aria-label="Fechar">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="modal__body">
              <Field label="Nome completo" required error={erros.nome}>
                <input className={`input ${erros.nome ? 'input--error' : ''}`} value={form.nome}
                  onChange={set('nome')} placeholder="Por favor, insira" />
              </Field>

              <div className="modal__row">
                <Field label="Unidade" required error={erros.unidade}>
                  <input className={`input ${erros.unidade ? 'input--error' : ''}`} value={form.unidade}
                    onChange={set('unidade')} placeholder="42" inputMode="numeric" />
                </Field>
                <Field label="Torre" required error={erros.torre}>
                  <input className={`input ${erros.torre ? 'input--error' : ''}`} value={form.torre}
                    onChange={set('torre')} placeholder="B" maxLength={2} />
                </Field>
              </div>

              <Field label="Email" required error={erros.email}
                hint="O convite de primeiro acesso ao app vai para este endereço">
                <input className={`input ${erros.email ? 'input--error' : ''}`} value={form.email}
                  onChange={set('email')} placeholder="Por favor, insira" type="email" />
              </Field>

              <Field label="Placa do veículo" hint="Opcional · identifica sessões de visitante">
                <input className="input" value={form.placa} onChange={set('placa')} placeholder="Opcional" />
              </Field>

              <InfoBanner tone="info" title="LGPD">
                Coletamos apenas identidade, unidade e telemetria da recarga — o necessário para o rateio.
                O morador consente na primeira entrada e pode revisar cada finalidade depois.
              </InfoBanner>
            </div>

            <div className="modal__foot">
              <Button variant="ghost" onClick={() => setAberto(false)}>Cancelar</Button>
              <Button type="submit" icon={UserPlus}>Cadastrar e convidar</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
