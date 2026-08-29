import './primitives.css';

export function Card({ children, flush, className = '', style }) {
  return (
    <div className={`card ${flush ? 'card--flush' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="section-title">
      <h2 className="eyebrow">{children}</h2>
      {action ? <span className="section-title__action">{action}</span> : null}
    </div>
  );
}

/** Valor e unidade são sempre um par; nunca embuta a unidade no valor. */
export function Metric({ value, unit, label, tone = 'default', size = 'md' }) {
  return (
    <div className="metric">
      <div className={`metric__pair metric__pair--${size}`}>
        <span className={`metric__value metric__value--${tone} tnum`}>{value}</span>
        {unit ? <span className="metric__unit">{unit}</span> : null}
      </div>
      {label ? <div className="metric__label">{label}</div> : null}
    </div>
  );
}

export function StatusPill({ status = 'info', children }) {
  return <span className={`pill pill--${status}`}>{children}</span>;
}

export function Button({ children, variant = 'primary', icon: Icon, onClick, type = 'button', disabled }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn btn--${variant}`}>
      {Icon ? <Icon size={17} strokeWidth={2} /> : null}
      {children}
    </button>
  );
}

/** Trilho de 6px; o marcador de limiar mostra a demanda contratada. */
export function Meter({ value, max = 100, tone = 'energy', threshold }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const over = threshold !== undefined && value >= threshold;
  return (
    <div className="meter">
      <div className={`meter__fill meter__fill--${over ? 'over' : tone}`} style={{ width: `${pct}%` }} />
      {threshold !== undefined ? (
        <div className="meter__threshold" style={{ left: `${(threshold / max) * 100}%` }} />
      ) : null}
    </div>
  );
}

export function InfoBanner({ tone = 'info', title, children }) {
  return (
    <div className={`banner banner--${tone}`}>
      <div className="banner__title">{title}</div>
      <div className="banner__body">{children}</div>
    </div>
  );
}

export function Field({ label, required, hint, error, children }) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {required ? <span className="field__req"> *</span> : null}
      </span>
      {children}
      {error ? <span className="field__error">{error}</span> : null}
      {!error && hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}
