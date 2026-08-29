import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useDerivedValue, interpolateColor, interpolate } from 'react-native-reanimated';
import { colors, motion } from '../theme/tokens';

const W = 46, H = 28, KNOB = 22;

export default function Toggle({ checked, onChange, disabled }) {
  const t = useDerivedValue(() => withTiming(checked ? 1 : 0, { duration: motion.base, easing: motion.easeStandard }), [checked]);

  // Travado nao dilui o acento: vermelho a 45% vira vinho e o knob some nele.
  const trackOff = disabled ? colors.surfaceInset : colors.controlTrackOff;
  const trackOn = disabled ? colors.surfaceRaised : colors.controlTrackOn;

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [trackOff, trackOn]),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [0, 1], [3, W - KNOB - 3]) }],
  }));

  return (
    <Pressable onPress={() => !disabled && onChange && onChange(!checked)} disabled={disabled} hitSlop={8}>
      <Animated.View style={[styles.track, track]}>
        <Animated.View
          style={[
            styles.knob,
            disabled && { backgroundColor: checked ? colors.textMuted : colors.textDisabled },
            knob,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, justifyContent: 'center' },
  knob: { width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: colors.controlKnob },
});
