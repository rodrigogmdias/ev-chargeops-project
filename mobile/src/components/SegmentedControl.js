import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, motion } from '../theme/tokens';

export default function SegmentedControl({ options, value, onChange, style }) {
  const [w, setW] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const seg = w ? (w - 8) / options.length : 0;

  const x = useDerivedValue(
    () => withTiming(index * seg, { duration: motion.base, easing: motion.easeStandard }),
    [index, seg],
  );
  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={[styles.track, style]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {seg > 0 ? (
        <Animated.View style={[styles.indicator, { width: seg }, indicator]} />
      ) : null}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            style={styles.option}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange && onChange(o.value);
            }}
          >
            <Text style={[styles.label, on && styles.labelOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row', height: 44, padding: 4,
    borderRadius: radius.pill, backgroundColor: colors.surfaceCard,
  },
  indicator: {
    position: 'absolute', top: 4, bottom: 4, left: 4,
    borderRadius: radius.pill, backgroundColor: colors.surfaceRaised,
  },
  option: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13.5, fontFamily: fonts.bold, color: colors.textSubtle },
  labelOn: { color: colors.textTitle },
});
