import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AppBar from '../src/components/AppBar';
import Button from '../src/components/Button';
import InfoBanner from '../src/components/InfoBanner';
import ListRow from '../src/components/ListRow';
import LimiteRecarga from '../src/components/LimiteRecarga';
import Icon from '../src/components/Icon';
import { Card, SectionTitle } from '../src/components/Card';
import { colors, fonts, radius, motion, fmt } from '../src/theme/tokens';
import { useApp, HISTORICO } from '../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(45 * i).easing(motion.easeSheet);

// 07 · Confirmar recarga (condomínio): sem cartão e sem bloqueio — o consumo
// é rateado por kWh medido e entra no boleto da unidade.
export default function Confirmar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ponto: p, iniciarLiberacao } = useApp();

  const mesKwh = useMemo(
    () => HISTORICO.agosto.sessoes.reduce((a, v) => a + v.kwh, 0),
    [],
  );

  const liberar = () => {
    iniciarLiberacao();
    router.push('/liberando');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar title="Confirmar recarga" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)}>
          <Card>
            <View style={styles.pontoRow}>
              <View style={styles.tile}>
                <Icon name="plug-zap" size={22} color={colors.statusCharging} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.pontoNome}>{p.nome}</Text>
                <Text style={styles.pontoHint}>R$ {fmt(p.tarifa)} por kWh · tarifa da concessionária</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={enter(1)} style={{ gap: 10 }}>
          <SectionTitle>Limite da recarga</SectionTitle>
          <LimiteRecarga />
        </Animated.View>

        <Animated.View entering={enter(2)} style={{ gap: 10 }}>
          <SectionTitle>Como será cobrado</SectionTitle>
          <Card padding={0}>
            <ListRow label="Energia medida" value={`R$ ${fmt(p.tarifa)} / kWh`} hint="Tarifa da concessionária, sem margem" />
            <ListRow label="Taxa de acesso" value="R$ 35,00 / mês" hint="Rateio da infraestrutura, já lançada" />
            <ListRow label="Taxa de ocupação" value="R$ 0,25 / min" hint="Só após 10 min de tolerância" />
            <ListRow label="Destino da cobrança" value="Boleto de setembro" hint="Unidade 42 · Torre B" divider={false} />
          </Card>
        </Animated.View>

        <Animated.View entering={enter(3)}>
          <InfoBanner tone="success" title="Sem cartão nesta recarga">
            No condomínio não há pagamento no app nem bloqueio de saldo. O consumo é rateado por kWh medido e entra no boleto da sua unidade — ANEEL RN 1.000/2021 e Lei 14.874/2024.
          </InfoBanner>
        </Animated.View>

        <Animated.View entering={enter(4)}>
          <Card padding={0}>
            <ListRow icon="file-text" label="Regras aprovadas em assembleia" hint="Tolerância de 10 min · taxa de acesso" chevron onPress={() => {}} />
            <ListRow
              icon="receipt" label="Consumo do mês até agora" value={`${fmt(mesKwh)} kWh`}
              divider={false} chevron onPress={() => router.push('/(tabs)/historico')}
            />
          </Card>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button variant="primary" size="lg" block haptic icon="zap" onPress={liberar}>
          Liberar carregador
        </Button>
        <Text style={styles.footnote}>Nenhum valor é cobrado agora. O rateio fecha no dia 01 e vai para o boleto.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  pontoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tile: {
    width: 44, height: 44, borderRadius: radius.tile,
    backgroundColor: colors.surfaceInset, alignItems: 'center', justifyContent: 'center',
  },
  pontoNome: { fontSize: 16, fontFamily: fonts.bold, color: colors.textTitle },
  pontoHint: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, gap: 8, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
  footnote: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSubtle, textAlign: 'center' },
});
