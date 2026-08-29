import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AppBar from '../src/components/AppBar';
import Button from '../src/components/Button';
import TextField from '../src/components/TextField';
import InfoBanner from '../src/components/InfoBanner';
import StatusPill from '../src/components/StatusPill';
import Icon from '../src/components/Icon';
import { Card } from '../src/components/Card';
import { colors, fonts, radius, motion } from '../src/theme/tokens';
import { useApp } from '../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(50 * i).easing(motion.easeSheet);

export default function Vinculo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { torre, setTorre, unidade, setUnidade, placa, setPlaca } = useApp();

  const invalido = !torre.trim() || !unidade.trim();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar title="Sua unidade" onBack={() => router.back()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={enter(0)}>
            <Text style={styles.title}>Vincule seu cadastro</Text>
            <Text style={styles.sub}>O rateio do kWh entra no boleto da unidade, por isso o vínculo é obrigatório.</Text>
          </Animated.View>

          <Animated.View entering={enter(1)}>
            <Card>
              <View style={styles.condRow}>
                <View style={styles.condIcon}>
                  <Icon name="building-2" size={22} color={colors.textSubtle} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.condName}>Condomínio Aclimação</Text>
                  <Text style={styles.condHint}>Detectado pelo convite do síndico</Text>
                </View>
                <StatusPill status="available" icon="check">Confirmado</StatusPill>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={enter(2)} style={{ gap: 12 }}>
            <TextField label="Torre" required value={torre} onChangeText={(v) => setTorre(v.toUpperCase())} autoCapitalize="characters" />
            <TextField label="Unidade" required value={unidade} onChangeText={setUnidade} keyboardType="number-pad" />
            <TextField
              label="Placa do veículo" placeholder="Opcional" icon="car" value={placa}
              onChangeText={(v) => setPlaca(v.toUpperCase())} autoCapitalize="characters"
              hint="Usada para identificar sessões de visitante"
            />
          </Animated.View>

          <Animated.View entering={enter(3)}>
            <InfoBanner tone="info" title="Lei 14.874/2024">
              A medição individualizada é o que permite cobrar de cada unidade só o que ela consumiu.
            </InfoBanner>
          </Animated.View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button variant="primary" size="lg" block haptic disabled={invalido} onPress={() => router.push('/consentimento')}>
            Continuar
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold, letterSpacing: -0.2, color: colors.textTitle },
  sub: { fontSize: 14, lineHeight: 21, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 6, marginBottom: 4 },
  condRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  condIcon: {
    width: 44, height: 44, borderRadius: radius.tile,
    backgroundColor: colors.surfaceInset, alignItems: 'center', justifyContent: 'center',
  },
  condName: { fontSize: 16, fontFamily: fonts.bold, color: colors.textTitle },
  condHint: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
});
