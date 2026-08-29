import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shell from './components/Shell';
import VisaoGeral from './pages/VisaoGeral';
import Rateio from './pages/Rateio';
import Moradores from './pages/Moradores';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<VisaoGeral />} />
          <Route path="rateio" element={<Rateio />} />
          <Route path="moradores" element={<Moradores />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
