import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Users, PlugZap, SlidersHorizontal, Gauge, Settings,
} from 'lucide-react';
import { usePortal } from '../state/PortalState';
import ConviteDrawer from './ConviteDrawer';
import Toast from './Toast';
import './shell.css';

const NAV = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true, titulo: ['Visão geral', 'Agosto de 2026 · em aberto'] },
  { to: '/rateio', label: 'Rateio', icon: Receipt, titulo: ['Rateio', 'Fechamento de agosto · envio à administradora'] },
  { to: '/moradores', label: 'Moradores', icon: Users, badge: true, titulo: ['Moradores', '40 unidades · 2 torres'] },
  { to: '/pontos', label: 'Pontos e capacidade', icon: PlugZap, titulo: ['Pontos e capacidade', '3 pontos no condomínio · Grupo A'] },
  { to: '/regras', label: 'Regras e tarifas', icon: SlidersHorizontal, titulo: ['Regras e tarifas', 'Vale para as próximas sessões'] },
  { to: '/sessoes', label: 'Sessões', icon: Gauge, titulo: ['Sessões', 'Medição bruta de agosto'] },
  { to: '/config', label: 'Configurações', icon: Settings, titulo: ['Configurações', 'Condomínio, administradora e LGPD'] },
];

export default function Shell() {
  const { totais } = usePortal();
  const { pathname } = useLocation();
  const atual = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to))) || NAV[0];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__name">EV ChargeOps</div>
          <div className="eyebrow">Portal do condomínio</div>
        </div>

        <nav className="sidebar__nav">
          {NAV.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className="navitem">
              <Icon size={17} strokeWidth={2} />
              <span className="navitem__label">{label}</span>
              {badge && totais.vazios ? <span className="navitem__badge">{totais.vazios}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__foot">
          <div className="sidebar__cond">
            <div className="eyebrow">Condomínio</div>
            <div className="sidebar__condName">Residencial Aclimação</div>
            <div className="sidebar__condMeta">2 torres · 40 unidades</div>
          </div>
          <div className="sidebar__user">
            <span className="sidebar__avatar">RC</span>
            <span className="sidebar__userInfo">
              <span className="sidebar__userName">Renata Coelho</span>
              <span className="sidebar__userRole">Síndica</span>
            </span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar__left">
            <span className="topbar__title">{atual.titulo[0]}</span>
            <span className="topbar__sub">{atual.titulo[1]}</span>
          </div>
          <div className="topbar__right">
            <span className="topbar__medindo">
              <span className="topbar__pulse" />
              3 pontos medindo
            </span>
            <span className="topbar__agora">25/08 · 22:41</span>
          </div>
        </header>

        <div className="page">
          <Outlet />
        </div>
      </main>

      <ConviteDrawer />
      <Toast />
    </div>
  );
}
