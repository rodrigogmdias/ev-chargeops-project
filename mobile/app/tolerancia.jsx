import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AppBar, { IconButton } from '../src/components/AppBar';
import Button from '../src/components/Button';
import InfoBanner from '../src/components/InfoBanner';
import ListRow from '../src/components/ListRow';
import MetricTile from '../src/components/MetricTile';
import Ring from '../src/components/Ring';
import Icon from '../src/components/Icon';
import { Card, SectionTitle } from '../src/components/Card';
import { colors, fonts, radius, motion, fmt } from '../src/theme/tokens';
import { useApp } from '../src/state/AppState';

const mmss = (secs) =>
  `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

export default function Tolerancia() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessao: s, ponto: p, pularTolerancia, fecharSessao } = useApp();

  const emMulta = s.tol === 0;
  const custo = s.kwh * p.tarifa;
  const multaMin = Math.floor(s.multaSecs / 60);
  const multa = multaMin * 0.25;

  const cor = emMulta ? colors.statusFault : colors.statusIdle;

  // Aviso tátil no instante em que a multa começa
  const notificou = useRef(false);
  useEffect(() => {
    if (emMulta && !notificou.current) {
      notificou.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [emMulta]);

  const verRecibo = () => {
    fecharSessao();
    router.replace('/recibo');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar
        title={emMulta ? 'Multa de ocupação' : 'Carga concluída'}
        actions={<IconButton icon="bell" onPress={() => router.navigate('/(tabs)/avisos')} />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Ring
            progress={emMulta ? Math.min(1, s.multaSecs / 900) : s.tol / 600}
            color={cor}
            glow={emMulta}
            glowColor={colors.statusFault}
          >
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={[styles.clock, { color: cor }]}>
                {emMulta ? mmss(s.multaSecs) : mmss(s.tol)}
              </Text>
              <Text style={styles.clockLabel}>
                {emMulta ? 'Tempo excedente' : 'Restante para remover o veículo'}
              </Text>
              <View style={[styles.pill, { backgroundColor: emMulta ? colors.statusFaultBg : colors.statusIdleBg }]}>
                <Icon name={emMulta ? 'triangle-alert' : 'clock'} size={13} color={cor} strokeWidth={2.4} />
                <Text style={[styles.pillText, { color: cor }]}>
                  {emMulta ? 'Multa em curso' : 'Tolerância gratuita'}
                </Text>
              </View>
            </View>
          </Ring>
        </View>

        <Animated.View entering={FadeInDown.duration(320).delay(60).easing(motion.easeSheet)}>
          <InfoBanner
            tone={emMulta ? 'danger' : 'warning'}
            title={emMulta ? 'Taxa de ocupação em curso' : 'Você tem 10 min de tolerância'}
          >
            {emMulta
              ? 'R$ 0,25 por minuto excedente, proporcional ao tempo. Retire o veículo para encerrar a cobrança — o valor entra no mesmo recibo.'
              : 'A recarga terminou. Retire o veículo dentro da tolerância e nada é cobrado além da energia. Avisamos no minuto 10 antes de qualquer taxa.'}
          </InfoBanner>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(110).easing(motion.easeSheet)} style={{ gap: 10 }}>
          <SectionTitle>Sessão encerrada</SectionTitle>
          <Card>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <MetricTile value={fmt(s.kwh)} unit="kWh" label="Energia medida" size="md" style={{ flex: 1 }} />
              <MetricTile value={fmt(custo)} unit="R$" label="Energia" size="md" style={{ flex: 1 }} />
              <MetricTile value={fmt(multa)} unit="R$" label="Ocupação" size="md" tone={multa > 0 ? 'fault' : 'default'} style={{ flex: 1 }} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(160).easing(motion.easeSheet)}>
          <Card padding={0}>
            <ListRow label="Aviso enviado" value={emMulta ? '22:20 e 22:30' : '22:20'} hint="Push · antes de qualquer cobrança" />
            <ListRow label="Tolerância" value="10 min" hint="Definida em assembleia" />
            <ListRow label="Taxa de ocupação" value="R$ 0,25 / min" hint="Proporcional ao tempo excedente" divider={false} />
          </Card>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button variant="primary" size="lg" block haptic icon="receipt" onPress={verRecibo}>
          Ver recibo
        </Button>
        <Button variant="ghost" size="md" block onPress={pularTolerancia}>
          {emMulta ? 'Avançar 5 min' : 'Pular a tolerância'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  clock: {
    fontSize: 44, lineHeight: 48, fontFamily: fonts.monoBold,
    fontVariant: ['tabular-nums'],
  },
  clockLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
  },
  pillText: { fontSize: 12, fontFamily: fonts.bold },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, gap: 8, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
});
