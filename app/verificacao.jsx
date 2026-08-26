import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AppBar from '../src/components/AppBar';
import Button from '../src/components/Button';
import Press from '../src/components/Press';
import Icon from '../src/components/Icon';
import { colors, fonts, radius, motion } from '../src/theme/tokens';
import { useApp } from '../src/state/AppState';

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function Verificacao() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, codigo, setCodigo } = useApp();

  const emailMasc = email ? email.replace(/^(.).*(@.*)$/, '$1•••••$2') : 'seu email';

  const press = (t) => {
    if (!t) return;
    Haptics.selectionAsync().catch(() => {});
    setCodigo(t === 'del' ? codigo.slice(0, -1) : (codigo + t).slice(0, 6));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 8 }]}>
      <AppBar title="Verificação" onBack={() => router.back()} />
      <View style={styles.body}>
        <View>
          <Text style={styles.title}>Código de 6 dígitos</Text>
          <Text style={styles.sub}>Enviamos para {emailMasc}. O código expira em 10 minutos.</Text>
        </View>

        <View style={styles.digits}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.digitBox, codigo.length === i && styles.digitActive]}>
              {codigo[i] ? (
                <Animated.Text entering={ZoomIn.duration(140).easing(motion.easeOut)} style={styles.digit}>
                  {codigo[i]}
                </Animated.Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.hint}>Não recebeu?</Text>
          <Text style={styles.link}>Reenviar em 0:42</Text>
        </View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeIn.duration(280)} style={styles.pad}>
          {TECLAS.map((t, i) => (
            <Press
              key={i}
              onPress={() => press(t)}
              disabled={!t}
              scaleTo={0.94}
              style={[styles.key, !t && { backgroundColor: 'transparent' }]}
            >
              {t === 'del'
                ? <Icon name="delete" size={22} color={colors.textTitle} />
                : <Text style={styles.keyLabel}>{t}</Text>}
            </Press>
          ))}
        </Animated.View>

        <Button
          variant="primary" size="lg" block haptic
          disabled={codigo.length < 6}
          onPress={() => router.push('/vinculo')}
          style={{ marginTop: 14 }}
        >
          Confirmar código
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 12, gap: 20 },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold, letterSpacing: -0.2, color: colors.textTitle },
  sub: { fontSize: 14, lineHeight: 21, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 6 },
  digits: { flexDirection: 'row', gap: 8 },
  digitBox: {
    flex: 1, height: 60, borderRadius: radius.input,
    backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  digitActive: { borderColor: colors.borderStrong },
  digit: { fontFamily: fonts.monoBold, fontSize: 24, color: colors.textTitle },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSubtle },
  link: { fontSize: 13, fontFamily: fonts.bold, color: colors.textLink },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  key: {
    width: '30%', flexGrow: 1, height: 52, borderRadius: radius.input,
    backgroundColor: colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
  },
  keyLabel: { fontSize: 20, fontFamily: fonts.bold, color: colors.textTitle },
});
