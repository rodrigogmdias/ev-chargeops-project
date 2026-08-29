import './ui.css';

export function Card({ children, flush, className = '', style }) {
  return <div className={`card ${flush ? 'card--flush' : ''} ${className}`} style={style}>{children}</div>;
}

/** KPI do design: eyebrow, numeral em mono e uma linha de contexto. */
export function Kpi({ eyebrow, value, unit, hint, tone = 'default' }) {
  return (
    <div className="card kpi">
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <div className="kpi__pair">
        <span className={`kpi__value kpi__value--${tone}`}>{value}</span>
        {unit ? <span className="kpi__unit">{unit}</span> : null}
      </div>
      {hint ? <div className="kpi__hint">{hint}</div> : null}
    </div>
  );
}

export function Pill({ tom = 'info', children }) {
  return <span className={`pill pill--${tom}`}>{children}</span>;
}

export function Dot({ tom }) {
  return <span className={`dot dot--${tom}`} />;
}

export function Button({ children, variant = 'primary', icon: Icon, onClick, type = 'button' }) {
  return (
    <button type={type} onClick={onClick} className={`btn btn--${variant}`}>
      {Icon ? <Icon size={17} strokeWidth={2} /> : null}
      {children}
    </button>
  );
}

export function PageTitle({ title, sub, tag, children }) {
  return (
    <header className="pagetitle">
      <div className="pagetitle__main">
        <div className="pagetitle__row">
          <h1 className="pagetitle__h1">{title}</h1>
          {tag}
        </div>
        {sub ? <p className="pagetitle__sub">{sub}</p> : null}
      </div>
      {children ? <div className="pagetitle__actions">{children}</div> : null}
    </header>
  );
}

/** Grupo de linhas label/hint/valor — usado em Regras e Configurações. */
export function GrupoLinhas({ titulo, hint, itens }) {
  return (
    <Card flush>
      <div className="grupo__head">
        <div className="grupo__title">{titulo}</div>
        {hint ? <div className="grupo__hint">{hint}</div> : null}
      </div>
      {itens.map((i) => (
        <div className="grupo__row" key={i.label}>
          <div className="grupo__label">
            <div className="grupo__labelMain">{i.label}</div>
            {i.hint ? <div className="grupo__labelHint">{i.hint}</div> : null}
          </div>
          <div className="grupo__valor">{i.valor}</div>
        </div>
      ))}
    </Card>
  );
}

export function Busca({ placeholder, value, onChange, width = 170 }) {
  return (
    <label className="busca">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        className="busca__input" style={{ width }} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Filtros({ opcoes, valor, onChange }) {
  return (
    <div className="filtros">
      {opcoes.map((o) => (
        <button
          key={o.value} type="button"
          className={`filtro ${valor === o.value ? 'is-on' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
