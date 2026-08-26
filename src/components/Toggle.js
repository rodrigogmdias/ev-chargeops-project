import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useDerivedValue, interpolateColor, interpolate } from 'react-native-reanimated';
import { colors, motion } from '../theme/tokens';

const W = 46, H = 28, KNOB = 22;

// DS Toggle: white knob in both themes, 200ms knob travel, no bounce.
export default function Toggle({ checked, onChange, disabled }) {
  const t = useDerivedValue(() => withTiming(checked ? 1 : 0, { duration: motion.base, easing: motion.easeStandard }), [checked]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [colors.controlTrackOff, colors.controlTrackOn]),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [0, 1], [3, W - KNOB - 3]) }],
  }));

  return (
    <Pressable onPress={() => !disabled && onChange && onChange(!checked)} disabled={disabled} hitSlop={8}>
      <Animated.View style={[styles.track, track, disabled && { opacity: 0.45 }]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, justifyContent: 'center' },
  knob: { width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: colors.controlKnob },
});
