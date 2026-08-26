import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AppBar, { IconButton } from '../../src/components/AppBar';
import Button from '../../src/components/Button';
import InfoBanner from '../../src/components/InfoBanner';
import ListRow from '../../src/components/ListRow';
import MetricTile from '../../src/components/MetricTile';
import StatusPill from '../../src/components/StatusPill';
import Sheet from '../../src/components/Sheet';
import Icon from '../../src/components/Icon';
import { Card, SectionTitle, Hairline } from '../../src/components/Card';
import { colors, fonts, radius, motion, fmt } from '../../src/theme/tokens';
import { useApp, PONTOS } from '../../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(45 * i).easing(motion.easeSheet);

export default function Ponto() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { setPontoId, flash } = useApp();
  const [fila, setFila] = useState(false);

  const p = PONTOS.find((q) => q.id === id) || PONTOS[0];
  const grupoA = p.regime === 'A';

  const continuar = () => {
    setPontoId(p.id);
    router.push('/pagamento');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar
        title="Ponto de recarga"
        onBack={() => router.back()}
        actions={<IconButton icon="bell" onPress={() => router.navigate('/(tabs)/avisos')} />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)}>
          <View style={styles.hero}>
            <LinearGradient
              colors={['rgba(232,18,31,0.12)', 'transparent']}
              start={{ x: 0.9, y: 0 }} end={{ x: 0.2, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroGlyph}>
              <Icon name="plug-zap" size={32} color={colors.textDisabled} />
            </View>
            <Text style={styles.heroTitle}>{p.nome}</Text>
            <Text style={styles.heroLocal}>{p.local}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
              <StatusPill status={p.livre ? 'available' : 'idle'}>{p.livre ? 'Livre agora' : 'Ocupado'}</StatusPill>
              <Text style={styles.heroMeta}>{p.meta}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <Card>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <MetricTile value={fmt(p.tarifa)} unit="R$/kWh" label="Tarifa agora" size="md" style={{ flex: 1 }} />
              <MetricTile value={p.pot} unit="kW" label="Potência nominal" size="md" style={{ flex: 1 }} />
              <MetricTile value={p.fator} unit="fator" label="Demanda do ponto" size="md" style={{ flex: 1 }} />
            </View>
            <Hairline style={{ marginVertical: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text style={styles.estLabel}>Custo estimado · 18 kWh</Text>
              <MetricTile value={fmt(p.tarifa * 18)} unit="R$" size="md" />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <InfoBanner
            tone={grupoA ? 'success' : 'info'}
            title={grupoA ? 'Grupo A · condomínio' : 'Grupo B · rede comercial'}
          >
            {grupoA
              ? 'Energia repassada a custo, sem margem — ANEEL RN 1.000/2021. O fator de demanda é só um sinal de horário disputado e não altera o preço do kWh.'
              : 'Preço livre com tarifa dinâmica. O fator de demanda multiplica a tarifa base e a NFS-e é emitida ao encerrar a sessão.'}
          </InfoBanner>
        </Animated.View>

        <Animated.View entering={enter(3)} style={{ gap: 10 }}>
          <SectionTitle>Como a conta é composta</SectionTitle>
          <Card padding={0}>
            <ListRow
              label="Energia"
              value={`R$ ${fmt(p.tarifa)} / kWh`}
              hint={grupoA ? 'Tarifa da concessionária, sem margem' : `Tarifa base × fator ${p.fator}`}
            />
            <ListRow
              label={grupoA ? 'Taxa de acesso' : 'Documento fiscal'}
              value={grupoA ? 'R$ 35,00 / mês' : 'NFS-e'}
              hint={grupoA ? 'Rateio da infraestrutura do ponto' : 'Emitida ao encerrar a sessão'}
            />
            <ListRow label="Taxa de ocupação" value="R$ 0,25 / min" hint="Após 10 min de tolerância" divider={false} />
          </Card>
        </Animated.View>

        <Animated.View entering={enter(4)} style={{ gap: 10 }}>
          <SectionTitle>Carregador</SectionTitle>
          <Card padding={0}>
            <ListRow label="Modelo" value="GoodWe HCA G2" />
            <ListRow label="Conector" value="Type 2 · Modo 3" />
            <ListRow label="Liberação" value="Remota pelo app" hint="SEMS Remote Control · RFID não usado" divider={false} />
          </Card>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {p.livre ? (
          <Button variant="primary" size="lg" block haptic icon="zap" onPress={continuar}>
            Continuar para pagamento
          </Button>
        ) : (
          <Button variant="secondary" size="lg" block icon="clock" onPress={() => setFila(true)}>
            Entrar na fila deste ponto
          </Button>
        )}
        <Text style={styles.footnote}>
          {grupoA
            ? `Pré-autorização de R$ ${fmt(p.preAut)} · captura ao encerrar · sem margem na energia`
            : `Pré-autorização de R$ ${fmt(p.preAut)} · captura ao encerrar · NFS-e automática`}
        </Text>
      </View>

      <Sheet visible={fila} onClose={() => setFila(false)}>
        <Text style={styles.sheetTitle}>Entrar na fila</Text>
        <Text style={styles.sheetSub}>
          Você fica em 2º lugar. Avisamos quando o ponto liberar e a vez fica reservada por 10 minutos.
        </Text>
        <Card padding={0} style={{ marginBottom: 16 }}>
          <ListRow label="Sessão em curso" value="termina ~22:20" />
          <ListRow label="Sua posição" value="2ª" />
          <ListRow label="Custo de reservar" value="sem custo" divider={false} />
        </Card>
        <Button
          variant="primary" size="lg" block haptic icon="clock"
          onPress={() => { setFila(false); flash('Você está 2º na fila deste ponto'); }}
        >
          Confirmar lugar na fila
        </Button>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  hero: {
    padding: 20, paddingHorizontal: 16, borderRadius: radius.card,
    backgroundColor: colors.surfaceCard, overflow: 'hidden',
  },
  heroGlyph: { position: 'absolute', top: 14, right: 14 },
  heroTitle: {
    fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold, letterSpacing: -0.2,
    color: colors.textTitle, maxWidth: 250,
  },
  heroLocal: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 4 },
  heroMeta: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textSubtle },
  estLabel: { fontSize: 14, fontFamily: fonts.semibold, color: colors.textMuted },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, gap: 8, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
  footnote: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSubtle, textAlign: 'center' },
  sheetTitle: { fontSize: 19, fontFamily: fonts.bold, color: colors.textTitle, marginBottom: 6 },
  sheetSub: { fontSize: 14, lineHeight: 21, fontFamily: fonts.medium, color: colors.textSubtle, marginBottom: 16 },
});
