import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AppBar from '../../src/components/AppBar';
import Icon from '../../src/components/Icon';
import { colors, fonts, radius, motion } from '../../src/theme/tokens';
import { NOTIFS } from '../../src/state/AppState';

const TOM = {
  charging: { cor: colors.statusCharging, bg: colors.statusChargingBg },
  idle: { cor: colors.statusIdle, bg: colors.statusIdleBg },
  fault: { cor: colors.statusFault, bg: colors.statusFaultBg },
  info: { cor: colors.statusInfo, bg: colors.statusInfoBg },
};

export default function Avisos() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar variant="large" title="Notificações" subtitle="Cada evento financeiro é avisado" />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFS.map((n, i) => {
          const t = TOM[n.tom] || TOM.info;
          return (
            <Animated.View
              key={`${n.titulo}-${i}`}
              entering={FadeInDown.duration(320).delay(50 * i).easing(motion.easeSheet)}
              style={styles.notif}
            >
              <View style={[styles.notifIcon, { backgroundColor: t.bg }]}>
                <Icon name={n.icone} size={18} color={t.cor} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.notifHead}>
                  <Text style={styles.notifTitle} numberOfLines={2}>{n.titulo}</Text>
                  <Text style={styles.notifHora}>{n.hora}</Text>
                </View>
                <Text style={styles.notifText}>{n.texto}</Text>
              </View>
            </Animated.View>
          );
        })}
        <Text style={styles.legal}>Nenhuma cobrança acontece sem um aviso anterior.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, gap: 12 },
  notif: {
    flexDirection: 'row', gap: 12, padding: 14,
    borderRadius: radius.card, backgroundColor: colors.surfaceCard,
  },
  notifIcon: {
    width: 36, height: 36, borderRadius: radius.input,
    alignItems: 'center', justifyContent: 'center',
  },
  notifHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  notifTitle: { flex: 1, fontSize: 15, fontFamily: fonts.bold, color: colors.textTitle },
  notifHora: { fontSize: 11, fontFamily: fonts.semibold, color: colors.textDisabled },
  notifText: { fontSize: 13, lineHeight: 19, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
  legal: { fontSize: 11, lineHeight: 16, fontFamily: fonts.medium, color: colors.textDisabled, textAlign: 'center', padding: 4 },
});
