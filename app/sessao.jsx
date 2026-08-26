import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeInDown, FadeOut, useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AppBar, { IconButton } from '../src/components/AppBar';
import Button from '../src/components/Button';
import InfoBanner from '../src/components/InfoBanner';
import ListRow from '../src/components/ListRow';
import MetricTile from '../src/components/MetricTile';
import ProgressMeter from '../src/components/ProgressMeter';
import Ring from '../src/components/Ring';
import Icon from '../src/components/Icon';
import { Card } from '../src/components/Card';
import { colors, fonts, radius, motion, fmt } from '../src/theme/tokens';
import { useApp } from '../src/state/AppState';

function BoltPulse() {
  const o = useSharedValue(0.55);
  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.55, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={style}>
      <Icon name="zap" size={13} color={colors.statusCharging} strokeWidth={2.6} />
    </Animated.View>
  );
}

export default function Sessao() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessao: s, ponto: p, encerrar } = useApp();

  const custo = s.kwh * p.tarifa;

  const onEncerrar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    encerrar();
    router.replace('/tolerancia');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar
        title="Recarga em andamento"
        actions={<IconButton icon="bell" onPress={() => router.navigate('/(tabs)/avisos')} />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(320)} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Ring
            progress={Math.min(1, s.kwh / 24)}
            color={colors.statusCharging}
            glow
          >
            <View style={{ alignItems: 'center', gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                <Text style={styles.kwh}>{fmt(s.kwh)}</Text>
                <Text style={styles.kwhUnit}>kWh</Text>
              </View>
              <Text style={styles.kwhLabel}>Energia acumulada</Text>
              <View style={styles.chargingPill}>
                <BoltPulse />
                <Text style={styles.chargingPillText}>Carregando · {Math.floor(s.secs / 4)} min</Text>
              </View>
            </View>
          </Ring>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(60).easing(motion.easeSheet)}>
          <Card>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <MetricTile
                value={s.throttling ? '4,50' : '7,40'} unit="kW" label="Potência efetiva"
                size="md" tone={s.throttling ? 'demand' : 'default'} style={{ flex: 1 }}
              />
              <MetricTile value={fmt(p.tarifa)} unit="R$/kWh" label="Tarifa travada" size="md" style={{ flex: 1 }} />
              <MetricTile value={fmt(custo)} unit="R$" label="Custo até agora" size="md" style={{ flex: 1 }} />
            </View>
          </Card>
        </Animated.View>

        {s.throttling ? (
          <Animated.View entering={FadeInDown.duration(280).easing(motion.easeSheet)} exiting={FadeOut.duration(200)}>
            <InfoBanner tone="warning" title="Potência reduzida pelo prédio">
              Outros pontos estão em uso e a demanda contratada é de 45 kW. O carregador entrega 4,5 kW agora — a sessão fica mais longa, o preço por kWh não muda.
            </InfoBanner>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.duration(320).delay(120).easing(motion.easeSheet)}>
          <Card>
            <ProgressMeter value={s.soc} max={100} segmented caption="Bateria do veículo" valueLabel={`${Math.round(s.soc)} %`} />
            <View style={{ height: 16 }} />
            <ProgressMeter
              value={s.demanda} max={45} tone="demand" threshold={36}
              caption="Demanda do condomínio" valueLabel={`${s.demanda} / 45 kW`}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(180).easing(motion.easeSheet)}>
          <Card padding={0}>
            <ListRow label="Ponto" value={p.nome} />
            <ListRow label="Pré-autorização" value={`R$ ${fmt(p.preAut)}`} hint="Captura ao encerrar" />
            <ListRow label="Término estimado" value="~ 22:20" hint="Aviso 15 min antes" divider={false} />
          </Card>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button variant="danger" size="lg" block icon="square" onPress={onEncerrar}>
          Encerrar recarga
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  kwh: {
    fontSize: 44, lineHeight: 48, fontFamily: fonts.bold, letterSpacing: -0.8,
    color: colors.statusCharging, fontVariant: ['tabular-nums'],
  },
  kwhUnit: { fontSize: 13, fontFamily: fonts.semibold, color: colors.textSubtle },
  kwhLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle },
  chargingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
    backgroundColor: colors.statusChargingBg,
  },
  chargingPillText: { fontSize: 12, fontFamily: fonts.bold, color: colors.statusCharging },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
});
