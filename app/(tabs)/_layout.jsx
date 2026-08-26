import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, useDerivedValue, interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Icon from '../../src/components/Icon';
import { colors, fonts, motion } from '../../src/theme/tokens';
import { useApp } from '../../src/state/AppState';

const TABS = [
  { name: 'buscar', label: 'Buscar', icon: 'map-pin' },
  { name: 'recarga', label: 'Recarga', icon: 'zap' },
  { name: 'avisos', label: 'Avisos', icon: 'bell' },
];

function TabItem({ tab, active, onPress, badge }) {
  const t = useDerivedValue(
    () => withTiming(active ? 1 : 0, { duration: motion.fast, easing: motion.easeStandard }),
    [active],
  );
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * t.value }, { scale: 1 + 0.06 * t.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 1], [colors.textSubtle, colors.accentOnQuiet]),
  }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: t.value }],
  }));

  return (
    <Pressable
      onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress(); }}
      style={styles.item}
    >
      <Animated.View style={iconStyle}>
        <Icon name={tab.icon} size={22} color={active ? colors.accentOnQuiet : colors.textSubtle} />
        {badge ? <View style={styles.badge} /> : null}
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]}>{tab.label}</Animated.Text>
      <Animated.View style={[styles.dot, dotStyle]} />
    </Pressable>
  );
}

function ChargeOpsTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { sessao } = useApp();
  const sessaoAtiva = ['liberando', 'sessao', 'tolerancia'].includes(sessao.phase);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceNav }]} />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(18,18,20,0.62)', borderTopWidth: 1, borderTopColor: colors.hairline }]} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          const active = state.index === index;
          return (
            <TabItem
              key={route.key}
              tab={tab}
              active={active}
              badge={tab.name === 'recarga' && sessaoAtiva}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!active && !event.defaultPrevented) navigation.navigate(route.name);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bgBase } }}
      tabBar={(props) => <ChargeOpsTabBar {...props} />}
    >
      <Tabs.Screen name="buscar" />
      <Tabs.Screen name="recarga" />
      <Tabs.Screen name="avisos" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  label: { fontSize: 11, fontFamily: fonts.bold },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  badge: {
    position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.statusCharging, borderWidth: 1.5, borderColor: colors.bgBase,
  },
});
