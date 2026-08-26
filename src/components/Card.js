import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, type } from '../theme/tokens';

// DS Card: --surface-card fill, 16px radius, no border, no shadow, 16px padding.
export function Card({ children, padding = spacing.cardPad, style }) {
  return <View style={[styles.card, { padding }, style]}>{children}</View>;
}

// Section headings sit OUTSIDE the card they introduce.
export function SectionTitle({ children, style }) {
  return <Text style={[type.eyebrow, styles.section, style]}>{children}</Text>;
}

export function Hairline({ style }) {
  return <View style={[styles.hairline, style]} />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceCard, borderRadius: radius.card },
  section: { marginTop: 8, marginBottom: -2, paddingHorizontal: 2 },
  hairline: { height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.hairline },
});
