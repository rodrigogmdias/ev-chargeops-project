import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Press from './Press';
import Icon from './Icon';
import { colors, radius, fonts } from '../theme/tokens';

const SIZES = {
  lg: { height: 52, fontSize: 16, icon: 19, px: 20 },
  md: { height: 44, fontSize: 15, icon: 17, px: 16 },
  sm: { height: 36, fontSize: 13, icon: 15, px: 12 },
};

// DS Button: primary e o unico CTA vermelho, chapado em --accent e sem sombra
// (o ctaProps do design passa background var(--accent) + boxShadow none).
export default function Button({
  children, variant = 'primary', size = 'md', icon, block, onPress, disabled, style, haptic,
}) {
  const s = SIZES[size] || SIZES.md;

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isFilled = isPrimary || isDanger || variant === 'secondary';

  // Desabilitado abandona o vermelho: o acento e racionado para o que e
  // acionavel. Sobre a superficie neutra o rotulo usa --text-subtle, que
  // le como inativo sem virar cinza-sobre-vinho.
  const textColor = disabled
    ? (isFilled ? colors.textSubtle : colors.textDisabled)
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
    style,
  ];

  const bg = disabled
    ? (isFilled
      ? { backgroundColor: colors.surfaceInset }
      : variant === 'outline'
        ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.hairline }
        : { backgroundColor: 'transparent' })
    : isPrimary
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
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
