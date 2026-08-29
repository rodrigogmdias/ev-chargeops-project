import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, fonts, radius } from '../theme/tokens';

const TONES = {
  info: { color: colors.statusInfo, bg: colors.statusInfoBg, icon: 'info' },
  success: { color: colors.statusCharging, bg: colors.statusChargingBg, icon: 'circle-check' },
  warning: { color: colors.statusIdle, bg: colors.statusIdleBg, icon: 'triangle-alert' },
  danger: { color: colors.statusFault, bg: colors.statusFaultBg, icon: 'triangle-alert' },
};

export default function InfoBanner({ tone = 'info', title, children, style }) {
  const t = TONES[tone] || TONES.info;
  return (
    <View style={[styles.banner, { backgroundColor: t.bg }, style]}>
      <Icon name={t.icon} size={17} color={t.color} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        {title ? <Text style={[styles.title, { color: t.color }]}>{title}</Text> : null}
        <Text style={styles.body}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.card,
  },
  title: { fontSize: 13.5, fontFamily: fonts.bold, marginBottom: 2 },
  body: { fontSize: 13, lineHeight: 19, fontFamily: fonts.medium, color: colors.textMuted },
});
