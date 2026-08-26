import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import TextField from '../src/components/TextField';
import Button from '../src/components/Button';
import InfoBanner from '../src/components/InfoBanner';
import { colors, fonts, motion } from '../src/theme/tokens';
import { useApp } from '../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(60 * i).easing(motion.easeSheet);

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, setEmail, senha, setSenha } = useApp();

  const invalido = !/.+@.+\..+/.test(email) || senha.length < 4;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(232,18,31,0.14)', 'rgba(232,18,31,0.04)', 'transparent']}
        start={{ x: 0.85, y: 0 }} end={{ x: 0.3, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={enter(0)}>
            <Text style={styles.wordmark}>EV ChargeOps</Text>
            <Text style={styles.tagline}>Sua recarga no condomínio, medida por kWh e cobrada com transparência.</Text>
          </Animated.View>

          <Animated.View entering={enter(1)} style={{ gap: 16, marginTop: 32 }}>
            <TextField
              label="Email" required icon="mail" value={email} onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextField
              label="Senha" required icon="lock" value={senha} onChangeText={setSenha}
              secureTextEntry
            />
            <Pressable style={{ alignSelf: 'flex-end', marginTop: -6 }}>
              <Text style={styles.link}>Esqueci minha senha</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={enter(2)} style={{ gap: 14, marginTop: 20 }}>
            <Button variant="primary" size="lg" block haptic disabled={invalido} onPress={() => router.push('/verificacao')}>
              Entrar
            </Button>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerLabel}>ou</Text>
              <View style={styles.divider} />
            </View>
            <Button variant="outline" size="lg" block icon="chrome" onPress={() => router.push('/verificacao')}>
              Continuar com Google
            </Button>
            <Button variant="outline" size="lg" block icon="apple" onPress={() => router.push('/verificacao')}>
              Continuar com Apple
            </Button>
          </Animated.View>

          <Animated.View entering={enter(3)} style={{ gap: 16, marginTop: 24 }}>
            <InfoBanner tone="info" title="LGPD">
              Coletamos identidade, telemetria e cobrança. Sua localização só é usada com o app aberto.
            </InfoBanner>
            <Text style={styles.footer}>
              Primeiro acesso? <Text style={styles.link}>Use o convite do síndico</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  content: { paddingHorizontal: 24, flexGrow: 1, justifyContent: 'center' },
  wordmark: { fontSize: 30, fontFamily: fonts.extrabold, letterSpacing: -0.6, color: colors.textTitle },
  tagline: { fontSize: 15, lineHeight: 22, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 6 },
  link: { fontSize: 13, fontFamily: fonts.bold, color: colors.textLink },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: colors.hairline },
  dividerLabel: {
    fontSize: 11, fontFamily: fonts.bold, letterSpacing: 0.9,
    textTransform: 'uppercase', color: colors.textDisabled,
  },
  footer: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSubtle, textAlign: 'center' },
});
