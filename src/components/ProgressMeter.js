import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, fonts, motion } from '../theme/tokens';

// DS ProgressMeter: 6px bar; segmented for battery, threshold tick for demand.
// Fill animates 320ms ease-out per the motion tokens.
export default function ProgressMeter({ value = 0, max = 100, tone = 'energy', segmented, threshold, caption, valueLabel }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(pct, { duration: motion.slow, easing: motion.easeOut });
  }, [pct, w]);

  const over = threshold !== undefined && value >= threshold;
  const fillColor = tone === 'demand' ? (over ? colors.meterOver : colors.meterDemand) : colors.meterEnergy;

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View>
      {(caption || valueLabel) ? (
        <View style={styles.head}>
          <Text style={styles.caption}>{caption}</Text>
          <Text style={[styles.valueLabel, over && { color: colors.meterOver }]}>{valueLabel}</Text>
        </View>
      ) : null}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: fillColor }, fillStyle]} />
        {segmented ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.segRow}>
              {Array.from({ length: 9 }).map((_, i) => (
                <View key={i} style={styles.segGap} />
              ))}
            </View>
          </View>
        ) : null}
        {threshold !== undefined ? (
          <View style={[styles.threshold, { left: `${(threshold / max) * 100}%` }]} pointerEvents="none" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 },
  caption: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle },
  valueLabel: { fontSize: 12, fontFamily: fonts.bold, color: colors.textTitle, fontVariant: ['tabular-nums'] },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.meterTrack, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  segRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' },
  segGap: { width: 2, backgroundColor: colors.bgBase, opacity: 0.9 },
  threshold: { position: 'absolute', top: -2, bottom: -2, width: 2, backgroundColor: colors.textMuted, borderRadius: 1 },
});
