import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Icon from './Icon';
import Button from './Button';
import Press from './Press';
import SegmentedControl from './SegmentedControl';
import { Card, Hairline } from './Card';
import { colors, fonts, radius, fmt } from '../theme/tokens';
import { useApp, CAP } from '../state/AppState';

const MODOS = [
  { value: 'valor', label: 'Por valor' },
  { value: 'energia', label: 'Por energia' },
];

export default function LimiteRecarga() {
  const {
    ponto: p, limModo, setLimModo, limValor, setLimValor, limKwh, setLimKwh,
    maxValor, limiteKwh,
  } = useApp();

  const limValorEf = Math.min(limValor, maxValor);
  const limKwhEf = Math.min(limKwh, CAP);
  const passo = Math.round(((maxValor - 10) / 3) / 5) * 5;
  const presets = limModo === 'valor'
    ? [10, 10 + passo, 10 + passo * 2, maxValor].map((n) => ({ n, label: `R$ ${n}` }))
    : [5, 10, 20, CAP].map((n) => ({ n, label: `${n} kWh` }));

  const setPreset = (n) => {
    Haptics.selectionAsync().catch(() => {});
    limModo === 'valor' ? setLimValor(n) : setLimKwh(n);
  };

  if (limModo === 'cheia') {
    return (
      <Card>
        <View style={styles.row}>
          <View style={styles.tile}>
            <Icon name="battery-charging" size={22} color={colors.statusCharging} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.tituloCheia}>Até encher</Text>
            <Text style={styles.hint}>
              ≈ R$ {fmt(CAP * p.tarifa)} · até {fmt(CAP, 1)} kWh de folga na bateria
            </Text>
          </View>
        </View>
        <Text style={styles.prosa}>
          A sessão vai até o veículo parar de aceitar carga. A unidade paga só o kWh medido.
        </Text>
        <Hairline style={{ marginVertical: 16 }} />
        <Button variant="outline" size="md" block icon="sliders-horizontal" onPress={() => setLimModo('valor')}>
          Definir um limite
        </Button>
      </Card>
    );
  }

  const numero = limModo === 'valor' ? fmt(limValorEf) : fmt(limKwhEf, 1);
  const equivalente = limModo === 'valor'
    ? `≈ ${fmt(limiteKwh, 1)} kWh`
    : `≈ R$ ${fmt(limKwhEf * p.tarifa)}`;

  return (
    <Card>
      <SegmentedControl
        options={MODOS}
        value={limModo}
        onChange={setLimModo}
        style={{ marginBottom: 18 }}
      />
      <Animated.View key={limModo} entering={FadeIn.duration(200)}>
        <View style={styles.numeroRow}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            {limModo === 'valor' ? <Text style={styles.prefixo}>R$</Text> : null}
            <Text style={styles.numero}>{numero}</Text>
            {limModo === 'energia' ? <Text style={styles.unidade}>kWh</Text> : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.equivalente}>{equivalente}</Text>
            <Text style={styles.equivalenteLabel}>a {fmt(p.tarifa)} por kWh</Text>
          </View>
        </View>
        <Slider
          style={{ marginTop: 14, height: 34 }}
          minimumValue={limModo === 'valor' ? 10 : 2}
          maximumValue={limModo === 'valor' ? maxValor : CAP}
          step={limModo === 'valor' ? 5 : 1}
          value={limModo === 'valor' ? limValorEf : limKwhEf}
          onValueChange={(n) => (limModo === 'valor' ? setLimValor(n) : setLimKwh(n))}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.meterTrack}
          thumbTintColor={colors.neutral0}
        />
        <View style={styles.presets}>
          {presets.map((q) => {
            const on = limModo === 'valor' ? limValorEf === q.n : limKwhEf === q.n;
            return (
              <Press key={q.label} onPress={() => setPreset(q.n)} scaleTo={0.95} style={[styles.preset, on && styles.presetOn]}>
                <Text style={[styles.presetLabel, on && styles.presetLabelOn]}>{q.label}</Text>
              </Press>
            );
          })}
        </View>
      </Animated.View>
      <Hairline style={{ marginVertical: 16 }} />
      <View style={styles.rodape}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.rodapeTitulo}>Encerra ao atingir o limite</Text>
          <Text style={styles.rodapeHint}>Avisamos 15 min antes de chegar lá</Text>
        </View>
        <Button variant="ghost" size="sm" onPress={() => setLimModo('cheia')}>Remover</Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tile: {
    width: 44, height: 44, borderRadius: radius.tile,
    backgroundColor: colors.surfaceInset, alignItems: 'center', justifyContent: 'center',
  },
  tituloCheia: { fontSize: 17, fontFamily: fonts.bold, color: colors.textTitle },
  hint: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
  prosa: { marginTop: 14, fontSize: 13, lineHeight: 19, fontFamily: fonts.medium, color: colors.textSubtle },
  numeroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  prefixo: { fontSize: 15, fontFamily: fonts.bold, color: colors.textSubtle },
  numero: {
    fontSize: 38, lineHeight: 42, fontFamily: fonts.bold, letterSpacing: -0.6,
    color: colors.textTitle, fontVariant: ['tabular-nums'],
  },
  unidade: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textSubtle },
  equivalente: { fontSize: 15, fontFamily: fonts.bold, color: colors.textTitle },
  equivalenteLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 1 },
  presets: { flexDirection: 'row', gap: 8, marginTop: 4 },
  preset: {
    flex: 1, height: 36, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.borderSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  presetOn: { backgroundColor: colors.surfaceInset, borderColor: 'transparent' },
  presetLabel: { fontSize: 13, fontFamily: fonts.bold, color: colors.textSubtle },
  presetLabelOn: { color: colors.textTitle },
  rodape: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rodapeTitulo: { fontSize: 13, fontFamily: fonts.bold, color: colors.textTitle },
  rodapeHint: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 1 },
});
