import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from './Icon';
import Press from './Press';
import { colors, fonts, spacing } from '../theme/tokens';

export default function AppBar({ title, subtitle, variant = 'default', onBack, actions, style }) {
  const router = useRouter();
  const showBack = onBack !== undefined ? !!onBack : false;
  const large = variant === 'large';

  return (
    <View style={[styles.bar, large && styles.large, style]}>
      {showBack ? (
        <Press
          onPress={onBack === true ? () => router.back() : onBack}
          style={styles.backBtn}
          scaleTo={0.92}
        >
          <Icon name={variant === 'modal' ? 'x' : 'chevron-left'} size={22} color={colors.textTitle} />
        </Press>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.title, large && styles.titleLarge]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {actions || null}
    </View>
  );
}

export function IconButton({ icon, onPress, tone, size = 40 }) {
  return (
    <Press
      onPress={onPress}
      scaleTo={0.92}
      style={[
        styles.iconBtn,
        { width: size, height: size, borderRadius: size / 2 },
        tone === 'inset' && { backgroundColor: colors.surfaceInset },
      ]}
    >
      <Icon name={icon} size={20} color={colors.textTitle} />
    </Press>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: spacing.appbarHeight,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.gutter, paddingVertical: 8,
  },
  large: { minHeight: 72, alignItems: 'flex-end', paddingBottom: 10 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, marginLeft: -8,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtn: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontFamily: fonts.bold, color: colors.textTitle },
  titleLarge: { fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold, letterSpacing: -0.2 },
  subtitle: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 1 },
});
