import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AppBar from '../src/components/AppBar';
import Button from '../src/components/Button';
import InfoBanner from '../src/components/InfoBanner';
import ListRow from '../src/components/ListRow';
import TextField from '../src/components/TextField';
import Toggle from '../src/components/Toggle';
import { Card } from '../src/components/Card';
import { colors, fonts, radius, motion } from '../src/theme/tokens';
import { useApp } from '../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(45 * i).easing(motion.easeSheet);

const maskNumero = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const maskValidade = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function NovoCartao() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { adicionarCartao, flash } = useApp();

  const [numero, setNumero] = useState('');
  const [nome, setNome] = useState('');
  const [validade, setValidade] = useState('');
  const [padrao, setPadrao] = useState(true);
  const [bloqueio, setBloqueio] = useState(true);

  const invalido = numero.replace(/\D/g, '').length < 13 || nome.trim().length < 3;

  const salvar = () => {
    adicionarCartao(numero.replace(/\D/g, '').slice(-4));
    flash('Cartão salvo e tokenizado');
    router.back();
  };

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'ios' ? 12 : insets.top }]}>
      <AppBar variant="modal" title="Novo cartão" onBack={() => router.back()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={enter(0)}>
            <View style={styles.cardPreview}>
              <LinearGradient
                colors={['#26262A', '#121214']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={['rgba(232,18,31,0.12)', 'transparent']}
                start={{ x: 0.9, y: 0 }} end={{ x: 0.2, y: 0.9 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardPreviewTop}>
                <LinearGradient colors={['#B4B4BA', '#57575E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chipzinho} />
                <Text style={styles.tokenizado}>Tokenizado</Text>
              </View>
              <View>
                <Text style={styles.cardNumero}>{numero || '•••• •••• •••• ••••'}</Text>
                <View style={{ flexDirection: 'row', gap: 22, marginTop: 12 }}>
                  <View>
                    <Text style={styles.cardMicroLabel}>Titular</Text>
                    <Text style={styles.cardMicroValue}>{nome || 'Nome do titular'}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardMicroLabel}>Validade</Text>
                    <Text style={styles.cardMicroValue}>{validade || 'MM/AA'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={enter(1)} style={{ gap: 14 }}>
            <TextField
              label="Número do cartão" required icon="credit-card"
              value={numero} onChangeText={(v) => setNumero(maskNumero(v))} keyboardType="number-pad"
            />
            <TextField
              label="Nome como está no cartão" required
              value={nome} onChangeText={(v) => setNome(v.toUpperCase())} autoCapitalize="characters"
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextField
                label="Validade" required placeholder="MM/AA"
                value={validade} onChangeText={(v) => setValidade(maskValidade(v))}
                keyboardType="number-pad" style={{ flex: 1 }}
              />
              <TextField label="CVV" required placeholder="•••" secureTextEntry keyboardType="number-pad" maxLength={4} style={{ flex: 1 }} />
            </View>
          </Animated.View>

          <Animated.View entering={enter(2)}>
            <Card padding={0}>
              <ListRow
                label="Usar como cartão padrão"
                trailing={<Toggle checked={padrao} onChange={setPadrao} />}
              />
              <ListRow
                label="Autorizar pré-bloqueio automático"
                hint="Necessário para liberar o carregador"
                divider={false}
                trailing={<Toggle checked={bloqueio} onChange={setBloqueio} />}
              />
            </Card>
          </Animated.View>

          <Animated.View entering={enter(3)}>
            <InfoBanner tone="info" title="LGPD">
              Coletamos apenas o necessário para a cobrança. O número completo nunca fica na infraestrutura do EV ChargeOps.
            </InfoBanner>
          </Animated.View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button variant="primary" size="lg" block haptic icon="shield-check" disabled={invalido} onPress={salvar}>
            Salvar cartão
          </Button>
          <Button variant="ghost" size="md" block onPress={() => router.back()}>
            Cancelar
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  cardPreview: {
    height: 150, borderRadius: radius.card, padding: 18,
    justifyContent: 'space-between', overflow: 'hidden',
  },
  cardPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chipzinho: { width: 36, height: 26, borderRadius: 5 },
  tokenizado: {
    fontSize: 11, fontFamily: fonts.extrabold, letterSpacing: 0.9,
    textTransform: 'uppercase', color: colors.textSubtle,
  },
  cardNumero: { fontFamily: fonts.monoBold, fontSize: 19, color: colors.textTitle, letterSpacing: 0.8 },
  cardMicroLabel: {
    fontSize: 9, fontFamily: fonts.extrabold, letterSpacing: 0.7,
    textTransform: 'uppercase', color: colors.textDisabled,
  },
  cardMicroValue: { fontSize: 12, fontFamily: fonts.bold, color: colors.textMuted, marginTop: 2 },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, gap: 8, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
});
