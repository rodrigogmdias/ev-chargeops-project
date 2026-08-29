import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';
import AppBar, { IconButton } from '../../src/components/AppBar';
import InfoBanner from '../../src/components/InfoBanner';
import ListRow from '../../src/components/ListRow';
import MetricTile from '../../src/components/MetricTile';
import SegmentedControl from '../../src/components/SegmentedControl';
import StatusPill from '../../src/components/StatusPill';
import { Card, SectionTitle, Hairline } from '../../src/components/Card';
import { colors, fonts, motion, fmt } from '../../src/theme/tokens';
import { useApp, HISTORICO } from '../../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(45 * i).easing(motion.easeSheet);

const MESES = [
  { value: 'agosto', label: 'Agosto' },
  { value: 'julho', label: 'Julho' },
];

const TOM_PILL = { charging: 'charging', idle: 'idle', fault: 'fault' };

function Barra({ v, label }) {
  const h = useSharedValue(0);
  const alvo = Math.round((v / 24) * 68);
  useEffect(() => {
    h.value = withTiming(Math.max(alvo, 2), { duration: motion.slow, easing: motion.easeOut });
  }, [alvo, h]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <View style={styles.barraCol}>
      <Text style={styles.barraValor}>{v > 0 ? fmt(v, 1) : '—'}</Text>
      <Animated.View style={[styles.barra, { backgroundColor: v > 0 ? colors.surfaceRaised : colors.hairline }, style]} />
      <Text style={styles.barraLabel}>{label}</Text>
    </View>
  );
}

export default function Historico() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mes, setMes } = useApp();

  const h = HISTORICO[mes] || HISTORICO.agosto;
  const soma = useMemo(() => h.sessoes.reduce((a, v) => ({
    kwh: a.kwh + v.kwh,
    energia: a.energia + v.kwh * 0.89,
    ocupacao: a.ocupacao + Math.max(0, v.valor - v.kwh * 0.89),
  }), { kwh: 0, energia: 0, ocupacao: 0 }), [h]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar
        variant="large" title="Histórico" subtitle="Unidade 42 · Torre B"
        actions={<IconButton icon="share-2" onPress={() => {}} />}
      />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enter(0)}>
          <SegmentedControl options={MESES} value={mes} onChange={setMes} />
        </Animated.View>

        <Animated.View entering={enter(1)} key={`resumo-${mes}`}>
          <Card>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <MetricTile value={fmt(soma.kwh)} unit="kWh" label="Consumo" size="md" style={{ flex: 1 }} />
              <MetricTile value={fmt(soma.energia)} unit="R$" label="Energia" size="md" style={{ flex: 1 }} />
              <MetricTile
                value={fmt(soma.ocupacao)} unit="R$" label="Ocupação" size="md"
                tone={soma.ocupacao > 0 ? 'fault' : 'default'} style={{ flex: 1 }}
              />
            </View>
            <Hairline style={{ marginVertical: 16 }} />
            <View style={{ gap: 8 }}>
              <View style={styles.kv}>
                <Text style={styles.k}>Taxa de acesso</Text>
                <Text style={styles.v}>R$ 35,00</Text>
              </View>
              <View style={[styles.kv, { alignItems: 'baseline' }]}>
                <Text style={styles.destino}>{h.destino}</Text>
                <MetricTile value={fmt(soma.energia + soma.ocupacao + 35)} unit="R$" size="md" />
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <Card>
            <View style={styles.chartHead}>
              <Text style={styles.chartTitle}>Consumo por semana</Text>
              <Text style={styles.chartUnit}>kWh</Text>
            </View>
            <View style={styles.chart}>
              {h.barras.map((b) => <Barra key={`${mes}-${b.label}`} v={b.v} label={b.label} />)}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={enter(3)}>
          <InfoBanner tone="success" title="Grupo A · condomínio">
            Energia repassada a custo, sem margem. A taxa de acesso cobre a infraestrutura do ponto e é definida em assembleia.
          </InfoBanner>
        </Animated.View>

        <Animated.View entering={enter(4)} style={{ gap: 10 }}>
          <View style={styles.sessoesHead}>
            <SectionTitle style={{ marginTop: 0 }}>Sessões</SectionTitle>
            <Text style={styles.qtd}>{h.qtd}</Text>
          </View>
          <Card padding={0}>
            {h.sessoes.map((v, i) => (
              <ListRow
                key={v.d}
                label={v.d}
                hint={v.st}
                value={`R$ ${fmt(v.valor)}`}
                trailing={<StatusPill status={TOM_PILL[v.tom] || 'info'}>{`${fmt(v.kwh)} kWh`}</StatusPill>}
                divider={i < h.sessoes.length - 1}
                chevron
                onPress={() => router.push('/recibo')}
              />
            ))}
          </Card>
        </Animated.View>

        <Text style={styles.legal}>Sessão interrompida registra o kWh parcial medido até a desconexão.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, gap: 12 },
  kv: { flexDirection: 'row', justifyContent: 'space-between' },
  k: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSubtle },
  v: { fontSize: 13, fontFamily: fonts.bold, color: colors.textTitle },
  destino: { fontSize: 14, fontFamily: fonts.semibold, color: colors.textMuted },
  chartHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 },
  chartTitle: { fontSize: 14, fontFamily: fonts.bold, color: colors.textTitle },
  chartUnit: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textSubtle },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 108 },
  barraCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  barraValor: { fontSize: 11, fontFamily: fonts.bold, color: colors.textSubtle },
  barra: { width: '100%', borderRadius: 6 },
  barraLabel: { fontSize: 10, fontFamily: fonts.semibold, color: colors.textDisabled },
  sessoesHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingRight: 2 },
  qtd: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textSubtle },
  legal: { fontSize: 11, lineHeight: 16, fontFamily: fonts.medium, color: colors.textDisabled, textAlign: 'center', paddingHorizontal: 12, paddingTop: 4 },
});
