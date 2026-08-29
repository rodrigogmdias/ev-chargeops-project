import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortalProvider } from './state/PortalState';
import Shell from './components/Shell';
import VisaoGeral from './pages/VisaoGeral';
import Rateio from './pages/Rateio';
import Moradores from './pages/Moradores';
import Pontos from './pages/Pontos';
import Regras from './pages/Regras';
import Sessoes from './pages/Sessoes';
import Config from './pages/Config';

export default function App() {
  return (
    <PortalProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<VisaoGeral />} />
            <Route path="rateio" element={<Rateio />} />
            <Route path="moradores" element={<Moradores />} />
            <Route path="pontos" element={<Pontos />} />
            <Route path="regras" element={<Regras />} />
            <Route path="sessoes" element={<Sessoes />} />
            <Route path="config" element={<Config />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PortalProvider>
  );
}
