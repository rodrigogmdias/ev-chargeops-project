import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { motion } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Press({ children, style, onPress, disabled, haptic = false, scaleTo = motion.pressScale, ...rest }) {
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = useCallback((e) => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress && onPress(e);
  }, [onPress, haptic]);

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withTiming(scaleTo, { duration: motion.fast, easing: motion.easeStandard }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: motion.fast, easing: motion.easeStandard }); }}
      onPress={handlePress}
      disabled={disabled}
      style={[style, aStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
