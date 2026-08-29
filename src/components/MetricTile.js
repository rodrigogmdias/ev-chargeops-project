import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/tokens';

const SIZES = {
  xl: { value: 38, lh: 42 },
  lg: { value: 26, lh: 30 },
  md: { value: 20, lh: 24 },
  sm: { value: 20, lh: 24 },
};

// Never bake the unit into the value string: value and unit are always a pair.
export default function MetricTile({ value, unit, label, size = 'md', tone = 'default', style }) {
  const s = SIZES[size] || SIZES.md;
  const valueColor =
    tone === 'demand' ? colors.statusIdle
      : tone === 'fault' ? colors.statusFault
        : tone === 'charging' ? colors.statusCharging
          : colors.textTitle;

  return (
    <View style={style}>
      <View style={styles.pair}>
        <Text style={[styles.value, { fontSize: s.value, lineHeight: s.lh, color: valueColor }]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  value: { fontFamily: fonts.bold, fontVariant: ['tabular-nums'] },
  unit: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textMuted },
  label: { fontSize: 12, lineHeight: 16, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
});
