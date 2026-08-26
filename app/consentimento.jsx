import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AppBar from '../src/components/AppBar';
import Button from '../src/components/Button';
import InfoBanner from '../src/components/InfoBanner';
import ListRow from '../src/components/ListRow';
import Toggle from '../src/components/Toggle';
import { Card } from '../src/components/Card';
import { colors, fonts, motion } from '../src/theme/tokens';
import { useApp, CONSENT } from '../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(50 * i).easing(motion.easeSheet);

export default function Consentimento() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { consent, setConsent, unidade, flash } = useApp();

  const entrar = () => {
    flash(`Cadastro vinculado à unidade ${unidade || '42'}`);
    router.replace('/(tabs)/buscar');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar title="Consentimento" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)}>
          <Text style={styles.title}>O que coletamos e por quê</Text>
          <Text style={styles.sub}>Coletamos apenas o necessário. Cada finalidade pode ser recusada, exceto as obrigatórias para a cobrança.</Text>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <Card padding={0}>
            {CONSENT.map((c, i) => (
              <ListRow
                key={c.id}
                icon={c.icone}
                label={c.label}
                hint={c.hint}
                divider={i < CONSENT.length - 1}
                trailing={(
                  <Toggle
                    checked={c.fixo ? true : !!consent[c.id]}
                    disabled={!!c.fixo}
                    onChange={(v) => setConsent((s) => ({ ...s, [c.id]: v }))}
                  />
                )}
              />
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <Card padding={0}>
            <ListRow icon="file-text" label="Termo de consentimento" hint="Versão 2.1 · 18/02/2026" chevron onPress={() => {}} />
            <ListRow icon="download" label="Portabilidade dos dados" chevron onPress={() => {}} />
            <ListRow icon="trash-2" label="Eliminar meus dados" hint="A qualquer momento, em Conta" chevron divider={false} onPress={() => {}} />
          </Card>
        </Animated.View>

        <Text style={styles.legal}>Histórico de sessões anonimizado após 24 meses · LGPD</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button variant="primary" size="lg" block haptic icon="shield-check" onPress={entrar}>
          Aceitar e entrar
        </Button>
        <Text style={styles.footerHint}>Você pode revisar cada finalidade depois, em Conta · Privacidade.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold, letterSpacing: -0.2, color: colors.textTitle },
  sub: { fontSize: 14, lineHeight: 21, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 6, marginBottom: 4 },
  legal: { fontSize: 11, lineHeight: 16, fontFamily: fonts.medium, color: colors.textDisabled, textAlign: 'center', paddingHorizontal: 12, paddingTop: 4 },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, gap: 8, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
  footerHint: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSubtle, textAlign: 'center' },
});
