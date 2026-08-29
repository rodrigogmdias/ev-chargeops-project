import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, Zap } from 'lucide-react';
import { CONDOMINIO } from '../data/condominio';
import './shell.css';

const NAV = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/rateio', label: 'Rateio', icon: Receipt },
  { to: '/moradores', label: 'Moradores', icon: Users },
];

export default function Shell() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__mark"><Zap size={18} strokeWidth={2.4} /></span>
          <span className="sidebar__wordmark">EV ChargeOps</span>
        </div>

        <nav className="sidebar__nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="navitem">
              <Icon size={19} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__foot">
          <div className="sidebar__cond">{CONDOMINIO.nome}</div>
          <div className="sidebar__meta">{CONDOMINIO.unidades} unidades · Grupo A</div>
        </div>
      </aside>

      <main className="content">
        <div className="content__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
