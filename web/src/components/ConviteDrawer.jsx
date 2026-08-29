import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CircleDashed } from 'lucide-react';
import { usePortal } from '../state/PortalState';
import { CAMPOS_MORADOR } from '../data/portal';
import { Button } from './ui';
import './convite.css';

const vazio = { torre: 'A', unidade: '', email: '', vaga: '' };

export default function ConviteDrawer() {
  const { conviteAberto, setConviteAberto, enviarConvite } = usePortal();
  const [form, setForm] = useState(vazio);
  const navigate = useNavigate();

  if (!conviteAberto) return null;

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const fechar = () => { setForm(vazio); setConviteAberto(false); };

  const enviar = () => {
    enviarConvite(form);
    setForm(vazio);
    navigate('/moradores');
  };

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label="Convidar morador">
      <button type="button" className="drawer__scrim" aria-label="Fechar" onClick={fechar} />
      <div className="drawer__panel">
        <div className="drawer__head">
          <div>
            <div className="drawer__title">Convidar morador</div>
            <p className="drawer__sub">
              Você informa a unidade e o e-mail. O morador completa nome, CPF, telefone e veículo
              no app, com consentimento LGPD.
            </p>
          </div>
          <button type="button" className="drawer__close" onClick={fechar} aria-label="Fechar">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="drawer__pair">
          <label className="campo">
            <span className="campo__label">Torre</span>
            <select className="campo__control" value={form.torre} onChange={set('torre')}>
              <option value="A">Torre A</option>
              <option value="B">Torre B</option>
            </select>
          </label>
          <label className="campo">
            <span className="campo__label">Unidade</span>
            <input className="campo__control" placeholder="42" value={form.unidade} onChange={set('unidade')} />
          </label>
        </div>

        <label className="campo">
          <span className="campo__label">E-mail do morador</span>
          <input className="campo__control" type="email" placeholder="morador@email.com"
            value={form.email} onChange={set('email')} />
          <span className="campo__hint">O convite vale por 7 dias e pode ser reenviado.</span>
        </label>

        <label className="campo">
          <span className="campo__label">Vaga vinculada</span>
          <input className="campo__control" placeholder="L1 · 12" value={form.vaga} onChange={set('vaga')} />
        </label>

        <div className="card card--flush">
          <div className="drawer__listHead eyebrow">O morador preenche no app</div>
          {CAMPOS_MORADOR.map((c) => (
            <div className="drawer__listRow" key={c.label}>
              <CircleDashed size={15} strokeWidth={2} className="drawer__listIcon" />
              <span className="drawer__listLabel">{c.label}</span>
              <span className="drawer__listHint">{c.hint}</span>
            </div>
          ))}
        </div>

        <div className="drawer__foot">
          <Button variant="outline" onClick={fechar}>Cancelar</Button>
          <Button onClick={enviar}>Enviar convite</Button>
        </div>
      </div>
    </div>
  );
}
