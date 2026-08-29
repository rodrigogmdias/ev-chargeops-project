import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle,
  withTiming, withRepeat, withSequence, Easing,
} from 'react-native-reanimated';
import { motion } from '../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// The signature ring: fills during charging, empties during tolerance,
// refills red once the occupancy fine starts. Progress + colour animate;
// an optional soft glow breathes behind it (the only continuous animation).
export default function Ring({
  size = 236, strokeWidth = 12, progress = 0, color, glow = false, glowColor, children,
}) {
  const r = (size - strokeWidth) / 2 - 4;
  const C = 2 * Math.PI * r;

  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: motion.slow, easing: motion.easeOut });
  }, [progress, p]);

  const dashProps = useAnimatedProps(() => ({
    strokeDashoffset: C - C * p.value,
  }));

  const pulse = useSharedValue(0);
  useEffect(() => {
    if (glow) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    } else {
      pulse.value = withTiming(0, { duration: motion.base });
    }
  }, [glow, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.16 + pulse.value * 0.24,
    transform: [{ scale: 1 + pulse.value * 0.045 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {glow ? (
        <Animated.View
          style={[
            styles.glow,
            { width: size * 0.9, height: size * 0.9, borderRadius: size, backgroundColor: glowColor || color },
            glowStyle,
          ]}
        />
      ) : null}
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }], position: 'absolute' }}>
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.10)" strokeWidth={strokeWidth} fill="none"
        />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${C}`}
          animatedProps={dashProps}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
