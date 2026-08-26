import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useDerivedValue, withTiming, interpolateColor } from 'react-native-reanimated';
import AppBar from '../src/components/AppBar';
import Button from '../src/components/Button';
import InfoBanner from '../src/components/InfoBanner';
import ListRow from '../src/components/ListRow';
import MetricTile from '../src/components/MetricTile';
import Press from '../src/components/Press';
import LimiteRecarga from '../src/components/LimiteRecarga';
import { Card, SectionTitle, Hairline } from '../src/components/Card';
import { colors, fonts, radius, motion, fmt } from '../src/theme/tokens';
import { useApp } from '../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(45 * i).easing(motion.easeSheet);

function CartaoRow({ c, on, onPress }) {
  const t = useDerivedValue(() => withTiming(on ? 1 : 0, { duration: motion.fast, easing: motion.easeStandard }), [on]);
  const border = useAnimatedStyle(() => ({
    borderColor: interpolateColor(t.value, [0, 1], ['transparent', colors.borderStrong]),
  }));
  const dot = useAnimatedStyle(() => ({ transform: [{ scale: t.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(t.value, [0, 1], [colors.borderStrong, colors.accent]),
  }));

  return (
    <Press onPress={onPress} scaleTo={0.985}>
      <Animated.View style={[styles.cartao, border]}>
        <View style={[styles.bandeira, { backgroundColor: c.marca }]}>
          <Text style={styles.bandeiraTxt}>{c.rede}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.numero}>{c.numero}</Text>
          <Text style={styles.detalhe}>{c.detalhe}</Text>
        </View>
        <Animated.View style={[styles.radio, ringStyle]}>
          <Animated.View style={[styles.radioDot, dot]} />
        </Animated.View>
      </Animated.View>
    </Press>
  );
}

export default function Pagamento() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ponto: p, cartoes, cartaoId, setCartaoId, iniciarLiberacao, preAut } = useApp();
  const grupoA = p.regime === 'A';

  const autorizar = () => {
    iniciarLiberacao();
    router.push('/liberando');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar title="Pagamento" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)} style={{ gap: 10 }}>
          <SectionTitle>Cartão</SectionTitle>
          {cartoes.map((c) => (
            <CartaoRow key={c.id} c={c} on={c.id === cartaoId} onPress={() => setCartaoId(c.id)} />
          ))}
          <Button variant="outline" size="md" block icon="plus" onPress={() => router.push('/novo-cartao')}>
            Adicionar cartão
          </Button>
        </Animated.View>

        <Animated.View entering={enter(1)} style={{ gap: 10 }}>
          <SectionTitle>Limite da recarga</SectionTitle>
          <LimiteRecarga />
        </Animated.View>

        <Animated.View entering={enter(2)} style={{ gap: 10 }}>
          <SectionTitle>Pré-autorização</SectionTitle>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text style={styles.blockLabel}>Bloqueio no cartão</Text>
              <MetricTile value={fmt(preAut)} unit="R$" size="md" />
            </View>
            <Hairline style={{ marginVertical: 14 }} />
            <View style={{ gap: 8 }}>
              <View style={styles.kv}><Text style={styles.k}>Tarifa travada agora</Text><Text style={styles.v}>R$ {fmt(p.tarifa)} / kWh</Text></View>
              <View style={styles.kv}><Text style={styles.k}>Captura</Text><Text style={styles.v}>ao encerrar a sessão</Text></View>
              <View style={styles.kv}><Text style={styles.k}>Documento</Text><Text style={styles.v}>{grupoA ? 'Rateio de despesa' : 'NFS-e'}</Text></View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={enter(3)}>
          <InfoBanner tone="info" title="Cartão tokenizado">
            Os dados do cartão ficam com o Stripe. O bloqueio é liberado se a recarga não iniciar.
          </InfoBanner>
        </Animated.View>

        <Animated.View entering={enter(4)}>
          <Card padding={0}>
            <ListRow icon="shield-check" label="Autenticação do banco" value="3-D Secure" />
            <ListRow icon="file-text" label="Regras da sessão" hint="Tolerância de 10 min · taxa de ocupação" chevron divider={false} onPress={() => {}} />
          </Card>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button variant="primary" size="lg" block haptic icon="lock" onPress={autorizar}>
          {`Autorizar R$ ${fmt(preAut)} e liberar`}
        </Button>
        <Text style={styles.footnote}>Você só é cobrado pelo que consumir. A diferença do bloqueio volta ao limite do cartão.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  cartao: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    borderRadius: radius.card, backgroundColor: colors.surfaceCard, borderWidth: 1,
  },
  bandeira: {
    width: 44, height: 30, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  bandeiraTxt: { fontSize: 9, fontFamily: fonts.extrabold, letterSpacing: 0.6, color: '#fff' },
  numero: { fontSize: 15, fontFamily: fonts.monoBold, color: colors.textTitle },
  detalhe: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  blockLabel: { fontSize: 15, fontFamily: fonts.semibold, color: colors.textMuted },
  kv: { flexDirection: 'row', justifyContent: 'space-between' },
  k: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSubtle },
  v: { fontSize: 13, fontFamily: fonts.bold, color: colors.textTitle },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, gap: 8, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
  footnote: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSubtle, textAlign: 'center' },
});
