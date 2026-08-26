import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors, fonts, radius } from '../theme/tokens';
import { useApp } from '../state/AppState';

// Global toast — desce do topo (toastDown do design), auto-dismiss no estado.
export default function ToastHost() {
  const { toast } = useApp();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[styles.host, { top: insets.top + 8 }]}>
      <Animated.View
        entering={FadeInUp.duration(280)}
        exiting={FadeOutUp.duration(180)}
        style={styles.toast}
      >
        <Icon name="circle-check" size={20} color={colors.statusCharging} />
        <Text style={styles.text}>{toast}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, zIndex: 40 },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: radius.card, backgroundColor: colors.surfaceRaised,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 32, shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  text: { flex: 1, fontSize: 14, fontFamily: fonts.semibold, color: colors.textTitle },
});
