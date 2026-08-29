import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AppBar from '../../src/components/AppBar';
import Button from '../../src/components/Button';
import Icon from '../../src/components/Icon';
import MetricTile from '../../src/components/MetricTile';
import StatusPill from '../../src/components/StatusPill';
import { Card, Hairline } from '../../src/components/Card';
import { colors, fonts, radius, motion, fmt } from '../../src/theme/tokens';
import { useApp } from '../../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(50 * i).easing(motion.easeSheet);

export default function Recarga() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessao: s, ponto: p } = useApp();

  const ativa = ['liberando', 'sessao', 'tolerancia'].includes(s.phase);
  const custo = s.kwh * p.tarifa;

  const destino =
    s.phase === 'liberando' ? '/liberando'
      : s.phase === 'tolerancia' ? '/tolerancia'
        : '/sessao';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar variant="large" title="Recarga" subtitle={ativa ? 'Sessão em andamento' : 'Nenhuma sessão ativa'} />
      <View style={[styles.body, { paddingBottom: insets.bottom + 100 }]}>
        {ativa ? (
          <Animated.View entering={enter(0)}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={styles.tile}>
                  <Icon name="battery-charging" size={22} color={colors.statusCharging} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.nome}>{p.nome}</Text>
                  <Text style={styles.local}>{p.local}</Text>
                </View>
                <StatusPill status={s.phase === 'tolerancia' ? (s.tol === 0 ? 'fault' : 'idle') : 'charging'}>
                  {s.phase === 'tolerancia' ? (s.tol === 0 ? 'Multa' : 'Tolerância') : 'Carregando'}
                </StatusPill>
              </View>
              <Hairline style={{ marginVertical: 14 }} />
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <MetricTile value={fmt(s.kwh)} unit="kWh" label="Energia" size="md" style={{ flex: 1 }} />
                <MetricTile value={fmt(custo)} unit="R$" label="Custo até agora" size="md" style={{ flex: 1 }} />
                <MetricTile value={`${Math.round(s.soc)}`} unit="%" label="Bateria" size="md" style={{ flex: 1 }} />
              </View>
              <View style={{ height: 16 }} />
              <Button variant="primary" size="lg" block haptic icon="zap" onPress={() => router.push(destino)}>
                Acompanhar sessão
              </Button>
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={enter(0)} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon name="plug-zap" size={30} color={colors.textSubtle} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma recarga ativa</Text>
            <Text style={styles.emptySub}>Por favor, escolha um ponto no mapa para começar</Text>
            <Button
              variant="primary" size="lg" icon="map-pin" haptic
              onPress={() => router.push('/(tabs)/buscar')}
              style={{ marginTop: 20, alignSelf: 'stretch' }}
              block
            >
              Buscar pontos
            </Button>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { flex: 1, paddingHorizontal: 16, gap: 12 },
  tile: {
    width: 44, height: 44, borderRadius: radius.tile,
    backgroundColor: colors.surfaceInset, alignItems: 'center', justifyContent: 'center',
  },
  nome: { fontSize: 16, fontFamily: fonts.bold, color: colors.textTitle },
  local: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, marginBottom: 80,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 22,
    borderWidth: 1.5, borderColor: colors.borderDashed, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontFamily: fonts.bold, color: colors.textTitle },
  emptySub: { fontSize: 14, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 4, textAlign: 'center' },
});
