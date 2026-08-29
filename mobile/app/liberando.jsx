import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Button from '../src/components/Button';
import Icon from '../src/components/Icon';
import ProgressMeter from '../src/components/ProgressMeter';
import { colors, fonts, radius, motion } from '../src/theme/tokens';
import { useApp, PASSOS } from '../src/state/AppState';

function Spinner({ size = 15, color }) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1);
  }, [rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <Animated.View style={style}>
      <Icon name="loader" size={size} color={color} />
    </Animated.View>
  );
}

export default function Liberando() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessao, iniciarSessao, resetSessao } = useApp();

  // Pulso do plug (plugPulse do design)
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1260, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
    );
  }, [pulse]);
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.42 }],
  }));

  useEffect(() => {
    if (sessao.passo >= 4) {
      const t = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        iniciarSessao();
        router.replace('/sessao');
      }, 700);
      return () => clearTimeout(t);
    }
  }, [sessao.passo, iniciarSessao, router]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.center}>
        <View style={styles.plugWrap}>
          <Animated.View style={[styles.halo, haloStyle]} />
          <View style={styles.plugCircle}>
            <Icon name="plug-zap" size={44} color={colors.statusCharging} />
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Liberando o carregador</Text>
          <Text style={styles.sub}>Mantenha o cabo conectado ao veículo. Isso leva alguns segundos.</Text>
        </View>

        <View style={styles.steps}>
          {PASSOS.map((s, i) => {
            const done = sessao.passo > i;
            const now = sessao.passo === i;
            return (
              <Animated.View key={s.label} entering={FadeInDown.duration(300).delay(60 * i).easing(motion.easeSheet)} style={styles.step}>
                <View style={[
                  styles.stepIcon,
                  done && { backgroundColor: colors.statusChargingBg },
                  now && { backgroundColor: colors.surfaceInset },
                ]}>
                  {done ? (
                    <Animated.View entering={ZoomIn.duration(180).easing(motion.easeOut)}>
                      <Icon name="check" size={15} color={colors.statusCharging} strokeWidth={2.6} />
                    </Animated.View>
                  ) : now ? (
                    <Spinner color={colors.textTitle} />
                  ) : (
                    <Icon name="circle" size={15} color={colors.textDisabled} />
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.stepLabel, { color: done || now ? colors.textTitle : colors.textDisabled }]}>{s.label}</Text>
                  <Text style={styles.stepHint}>{s.hint}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <ProgressMeter value={sessao.passo} max={4} tone="energy" />
      </View>

      <Button variant="ghost" size="md" block onPress={() => { resetSessao(); router.back(); }}>
        Cancelar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase, paddingHorizontal: 24 },
  center: { flex: 1, justifyContent: 'center', gap: 32 },
  plugWrap: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute', width: 104, height: 104, borderRadius: 52,
    backgroundColor: colors.statusCharging,
  },
  plugCircle: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: colors.statusChargingBg,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold, letterSpacing: -0.2,
    color: colors.textTitle, textAlign: 'center',
  },
  sub: {
    fontSize: 14, lineHeight: 21, fontFamily: fonts.medium, color: colors.textSubtle,
    textAlign: 'center', marginTop: 6,
  },
  steps: { borderRadius: radius.card, overflow: 'hidden', gap: 1, backgroundColor: colors.hairline },
  step: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    backgroundColor: colors.surfaceCard,
  },
  stepIcon: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  stepLabel: { fontSize: 15, fontFamily: fonts.semibold },
  stepHint: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 1 },
});
