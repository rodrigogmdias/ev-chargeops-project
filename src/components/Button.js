import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Press from './Press';
import Icon from './Icon';
import { colors, radius, fonts } from '../theme/tokens';

const SIZES = {
  lg: { height: 52, fontSize: 16, icon: 19, px: 20 },
  md: { height: 44, fontSize: 15, icon: 17, px: 16 },
  sm: { height: 36, fontSize: 13, icon: 15, px: 12 },
};

// DS Button: primary is the single red CTA (accent gradient + glow); the rest are quiet.
export default function Button({
  children, variant = 'primary', size = 'md', icon, block, onPress, disabled, style, haptic,
}) {
  const s = SIZES[size] || SIZES.md;

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  const textColor = disabled
    ? colors.textDisabled
    : isPrimary || isDanger
      ? colors.textOnAccent
      : variant === 'ghost'
        ? colors.textSubtle
        : colors.textTitle;

  const inner = (
    <View style={[styles.inner, { height: s.height, paddingHorizontal: s.px }]}>
      {icon ? <Icon name={icon} size={s.icon} color={textColor} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: s.fontSize, color: textColor }}>{children}</Text>
    </View>
  );

  const base = [
    styles.base,
    block && { alignSelf: 'stretch' },
    disabled && { opacity: 0.55 },
    style,
  ];

  if (isPrimary && !disabled) {
    return (
      <Press onPress={onPress} disabled={disabled} haptic={haptic} style={[base, styles.glow]}>
        <LinearGradient colors={[colors.red400, colors.red600]} style={styles.fill}>
          {inner}
        </LinearGradient>
      </Press>
    );
  }

  const bg = isPrimary
    ? { backgroundColor: colors.accent }
    : isDanger
      ? { backgroundColor: colors.accent }
      : variant === 'secondary'
        ? { backgroundColor: colors.surfaceInset }
        : variant === 'outline'
          ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderSubtle }
          : { backgroundColor: 'transparent' };

  return (
    <Press onPress={onPress} disabled={disabled} haptic={haptic} style={[base, bg]}>
      {inner}
    </Press>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.card, overflow: 'hidden' },
  fill: { borderRadius: radius.card },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  glow: {
    shadowColor: colors.accent, shadowOpacity: 0.32, shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
