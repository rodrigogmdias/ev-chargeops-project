import { useNavigate } from 'react-router-dom';
import { TriangleAlert, CircleCheck, CircleDashed } from 'lucide-react';
import { Card, Kpi, Dot, Button } from '../components/ui';
import { usePortal } from '../state/PortalState';
import {
  BARRAS, MAX_BARRA, PONTOS_RESUMO, DEMANDA_AGORA, LIMITE_CONTRATADO,
  TARIFA, TAXA_ACESSO, MES_REFERENCIA, brl, num,
} from '../data/portal';
import './pages.css';

export default function VisaoGeral() {
  const { unidades, totais } = usePortal();
  const navigate = useNavigate();

  const top = [...unidades].sort((a, b) => b.total - a.total).slice(0, 5);
  const media = totais.kwh / Math.max(1, totais.comConsumo);

  const checklist = [
    { label: 'Medição fechada', hint: 'Nenhuma sessão aberta nos últimos 3 dias', feito: true },
    { label: 'Tarifa e taxas confirmadas', hint: `R$ ${brl(TARIFA)} por kWh · R$ ${brl(TAXA_ACESSO)} de acesso`, feito: true },
    { label: 'CSV enviado à administradora', hint: 'Pendente · até 01/09', feito: false },
  ];

  return (
    <div className="stack">
      <div className="grid4">
        <Kpi eyebrow="Energia do mês" value={num(totais.kwh, 1)} unit="kWh" hint="Medição consolidada dos 3 pontos" />
        <Kpi eyebrow="Valor a ratear" value={`R$ ${brl(totais.geral)}`} hint="Energia, taxa de acesso e ocupação" />
        <Kpi eyebrow="Unidades com consumo" value={String(totais.comConsumo)} unit="de 40"
          hint={`Média de ${num(media, 1)} kWh por unidade`} />
        <Kpi eyebrow="Taxa de ocupação" value={`R$ ${brl(totais.ocupacao)}`} tone="demand"
          hint="Veículos parados após a tolerância" />
      </div>

      <div className="gridVisao">
        <Card className="chartCard">
          <div className="cardHead">
            <div className="cardHead__title">Consumo por semana · agosto</div>
            <div className="cardHead__hint">kWh medidos nos 3 pontos do condomínio</div>
          </div>
          <div className="chart">
            {BARRAS.map(([semana, v]) => (
              <div className="chart__col" key={semana}>
                <div className="chart__rotulo">{num(v, 0)}</div>
                <div
                  className={`chart__bar ${v === 372.8 ? 'chart__bar--pico' : ''}`}
                  style={{ height: `${Math.round((v / MAX_BARRA) * 118)}px` }}
                />
                <div className="chart__semana">{semana}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="capCard">
          <div className="cardHead__title">Capacidade elétrica agora</div>
          <div>
            <div className="cap__row">
              <span className="cap__label">Demanda do prédio</span>
              <span className="cap__valor">{num(DEMANDA_AGORA, 1)} de {LIMITE_CONTRATADO} kW</span>
            </div>
            <div className="meter">
              <div className="meter__fill meter__fill--demand"
                style={{ width: `${Math.round((DEMANDA_AGORA / LIMITE_CONTRATADO) * 100)}%` }} />
            </div>
            <p className="cap__nota">
              Limite contratado de {LIMITE_CONTRATADO} kW. O balanceamento reduz a potência dos
              pontos antes de chegar ao limite.
            </p>
          </div>
          <div className="hairline" />
          <div className="cap__pontos">
            {PONTOS_RESUMO.map((p) => (
              <div className="cap__ponto" key={p.nome}>
                <Dot tom={p.tom} />
                <span className="cap__pontoNome">{p.nome}</span>
                <span className="cap__pontoKw">{p.kw}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid2">
        <Card flush>
          <div className="cardHead cardHead--row">
            <div className="cardHead__title">Maiores consumos do mês</div>
            <button type="button" className="btn btn--link" onClick={() => navigate('/rateio')}>Ver rateio</button>
          </div>
          {top.map((u) => (
            <div className="topRow" key={u.id}>
              <div className="topRow__unidade">{u.unidade}</div>
              <div className="topRow__nome">{u.nome}</div>
              <div className="topRow__kwh">{num(u.kwh, 1)} kWh</div>
              <div className="topRow__total">R$ {brl(u.total)}</div>
            </div>
          ))}
        </Card>

        <div className="stack stack--tight">
          <div className="alerta">
            <TriangleAlert size={18} strokeWidth={2} className="alerta__icon" />
            <div>
              <div className="alerta__title">{totais.vazios} unidades sem cadastro completo</div>
              <p className="alerta__body">
                Sem morador vinculado, a sessão não entra no rateio da unidade. Envie o convite
                antes do fechamento em 01/09.
              </p>
              <button type="button" className="btn btn--outline btn--sm alerta__cta"
                onClick={() => navigate('/moradores')}>
                Abrir moradores
              </button>
            </div>
          </div>

          <Card className="fechamento">
            <div className="cardHead__title">Fechamento de {MES_REFERENCIA.split(' de ')[0]}</div>
            <div className="check">
              {checklist.map((c) => (
                <div className="check__row" key={c.label}>
                  {c.feito
                    ? <CircleCheck size={16} strokeWidth={2} className="check__icon check__icon--ok" />
                    : <CircleDashed size={16} strokeWidth={2} className="check__icon" />}
                  <div>
                    <div className="check__label">{c.label}</div>
                    <div className="check__hint">{c.hint}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate('/rateio')}>Revisar o rateio</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
