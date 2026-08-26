import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, motion } from '../theme/tokens';

const { height: SCREEN_H } = Dimensions.get('window');

// DS BottomSheet: 20px top corners, flat 62% black scrim, 280ms decelerating
// slide (--ease-sheet). Drag down to dismiss.
export default function Sheet({ visible, onClose, children }) {
  const [mounted, setMounted] = useState(visible);
  const ty = useSharedValue(SCREEN_H);
  const scrim = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const unmount = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      ty.value = withTiming(0, { duration: motion.sheet, easing: motion.easeSheet });
      scrim.value = withTiming(1, { duration: motion.sheet, easing: motion.easeOut });
    } else if (mounted) {
      ty.value = withTiming(SCREEN_H, { duration: motion.base, easing: motion.easeIn }, () => runOnJS(unmount)());
      scrim.value = withTiming(0, { duration: motion.base, easing: motion.easeIn });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      ty.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 90 || e.velocityY > 700) {
        ty.value = withTiming(SCREEN_H, { duration: motion.base, easing: motion.easeIn });
        scrim.value = withTiming(0, { duration: motion.base });
        if (onClose) runOnJS(onClose)();
      } else {
        ty.value = withTiming(0, { duration: motion.fast, easing: motion.easeOut });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceScrim }, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={styles.anchor} pointerEvents="box-none">
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }, sheetStyle]}>
            <View style={styles.grabber} />
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surfaceSheet,
    borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet,
    paddingHorizontal: 16, paddingTop: 10,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 24,
  },
  grabber: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderSubtle,
    alignSelf: 'center', marginBottom: 14,
  },
});
