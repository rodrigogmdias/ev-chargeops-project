import React from 'react';
import * as Lucide from 'lucide-react-native';
import { colors } from '../theme/tokens';

// Accepts the kebab-case slugs used across the design file.
const pascal = (slug) =>
  slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');

export default function Icon({ name, size = 22, color = colors.textBody, strokeWidth = 2, style }) {
  const Cmp = Lucide[pascal(name)] || Lucide.Circle;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}
