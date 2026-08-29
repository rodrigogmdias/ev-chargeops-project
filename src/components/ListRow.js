import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from './Icon';
import { colors, fonts, radius } from '../theme/tokens';

export default function ListRow({ icon, label, hint, value, trailing, chevron, divider = true, onPress }) {
  const body = (
    <View style={[styles.row, !divider && styles.noDivider]}>
      {icon ? (
        <View style={styles.iconTile}>
          <Icon name={icon} size={18} color={colors.textSubtle} />
        </View>
      ) : null}
      <View style={styles.mid}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {trailing || null}
      {chevron ? <Icon name="chevron-right" size={17} color={colors.textDisabled} /> : null}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }}>
        {body}
      </Pressable>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  noDivider: { borderBottomWidth: 0 },
  iconTile: {
    width: 34, height: 34, borderRadius: radius.input,
    backgroundColor: colors.surfaceInset, alignItems: 'center', justifyContent: 'center',
  },
  mid: { flex: 1, minWidth: 0 },
  label: { fontSize: 14.5, fontFamily: fonts.semibold, color: colors.textTitle },
  hint: { fontSize: 12, lineHeight: 16, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
  value: { fontSize: 14, fontFamily: fonts.bold, color: colors.textTitle, textAlign: 'right', flexShrink: 1 },
});
