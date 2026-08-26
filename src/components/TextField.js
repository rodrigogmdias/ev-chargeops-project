import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useDerivedValue, interpolateColor } from 'react-native-reanimated';
import Icon from './Icon';
import { colors, fonts, radius, motion } from '../theme/tokens';

// DS TextField: 12px radius input, label with red required asterisk,
// border animates to strong on focus (200ms border swap).
export default function TextField({
  label, required, placeholder = 'Por favor, insira', icon, value, onChangeText,
  secureTextEntry, keyboardType, autoCapitalize = 'none', hint, style, maxLength,
}) {
  const [focused, setFocused] = useState(false);

  const t = useDerivedValue(() => withTiming(focused ? 1 : 0, { duration: motion.base, easing: motion.easeStandard }), [focused]);
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(t.value, [0, 1], [colors.borderSubtle, colors.borderStrong]),
  }));

  return (
    <View style={style}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={{ color: colors.accent }}> *</Text> : null}
        </Text>
      ) : null}
      <Animated.View style={[styles.field, borderStyle]}>
        {icon ? <Icon name={icon} size={17} color={focused ? colors.textMuted : colors.textDisabled} /> : null}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.accent}
        />
      </Animated.View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13.5, fontFamily: fonts.semibold, color: colors.textMuted, marginBottom: 7 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 50, paddingHorizontal: 14,
    backgroundColor: colors.surfaceCard, borderRadius: radius.input,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, fontFamily: fonts.semibold, color: colors.textTitle, paddingVertical: 0 },
  hint: { fontSize: 12, lineHeight: 16, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 6 },
});
