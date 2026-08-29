import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, fonts, radius } from '../theme/tokens';

const STATUS = {
  available: { color: colors.statusCharging, bg: colors.statusChargingBg, icon: 'zap' },
  charging: { color: colors.statusCharging, bg: colors.statusChargingBg, icon: 'battery-charging' },
  idle: { color: colors.statusIdle, bg: colors.statusIdleBg, icon: 'clock' },
  fault: { color: colors.statusFault, bg: colors.statusFaultBg, icon: 'triangle-alert' },
  info: { color: colors.statusInfo, bg: colors.statusInfoBg, icon: 'info' },
  offline: { color: colors.statusOffline, bg: colors.statusOfflineBg, icon: 'plug' },
};

export default function StatusPill({ status = 'info', icon, children, style }) {
  const s = STATUS[status] || STATUS.info;
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }, style]}>
      <Icon name={icon || s.icon} size={12} color={s.color} strokeWidth={2.4} />
      <Text style={[styles.text, { color: s.color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
  },
  text: { fontSize: 12, fontFamily: fonts.bold },
});
