import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import AppBar, { IconButton } from '../../src/components/AppBar';
import Button from '../../src/components/Button';
import Press from '../../src/components/Press';
import Icon from '../../src/components/Icon';
import StatusPill from '../../src/components/StatusPill';
import { darkMapStyle } from '../../src/theme/mapStyle';
import { colors, fonts, radius, motion } from '../../src/theme/tokens';
import { useApp, PONTOS, USER_LOCATION } from '../../src/state/AppState';

const CHIPS = [
  { id: 'todos', label: 'Todos' },
  { id: 'cond', label: 'Condomínio' },
  { id: 'com', label: 'Comercial' },
  { id: 'livres', label: 'Só livres' },
];

function Chip({ label, active, onPress }) {
  return (
    <Press onPress={onPress} scaleTo={0.95} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[styles.chipLabel, active && styles.chipLabelOn]}>{label}</Text>
    </Press>
  );
}

function PontoCard({ p, selected, onPress }) {
  const cor = p.livre ? colors.statusCharging : colors.statusIdle;
  return (
    <Press onPress={onPress} scaleTo={0.98} style={[styles.card, selected && { borderColor: colors.borderStrong }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={styles.cardIcon}>
          <Icon name="plug-zap" size={22} color={cor} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardName}>{p.nome}</Text>
          <Text style={styles.cardLocal}>{p.local}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.cardTarifa}>R$ {p.tarifa.toFixed(2).replace('.', ',')}</Text>
          <Text style={styles.cardUnit}>por kWh</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <StatusPill status={p.livre ? 'available' : 'idle'}>{p.livre ? 'Livre' : 'Ocupado'}</StatusPill>
        <Text style={styles.cardMeta}>{p.meta}</Text>
      </View>
    </Press>
  );
}

export default function Buscar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { pontoId, setPontoId, filtro, setFiltro, unidade, torre } = useApp();
  const [vista, setVista] = useState('mapa');

  const lista = useMemo(() => PONTOS.filter((q) => {
    if (filtro === 'cond') return q.regime === 'A';
    if (filtro === 'com') return q.regime === 'B';
    if (filtro === 'livres') return q.livre;
    return true;
  }), [filtro]);

  const selecionado = PONTOS.find((p) => p.id === pontoId) || PONTOS[0];

  const focarPonto = (p) => {
    setPontoId(p.id);
    mapRef.current?.animateToRegion(
      { latitude: p.lat - 0.0016, longitude: p.lng, latitudeDelta: 0.011, longitudeDelta: 0.011 },
      420,
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar
        variant="large"
        title="Buscar pontos"
        subtitle={`Unidade ${unidade || '42'} · Torre ${torre || 'B'}`}
        actions={(
          <IconButton
            icon={vista === 'mapa' ? 'list' : 'map'}
            tone="inset"
            onPress={() => setVista(vista === 'mapa' ? 'lista' : 'mapa')}
          />
        )}
      />

      {vista === 'mapa' ? (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            customMapStyle={darkMapStyle}
            userInterfaceStyle="dark"
            initialRegion={{
              latitude: -23.5718, longitude: -46.6298,
              latitudeDelta: 0.016, longitudeDelta: 0.016,
            }}
            showsPointsOfInterest={false}
            showsCompass={false}
            toolbarEnabled={false}
          >
            {/* Sua localização */}
            <Marker coordinate={{ latitude: USER_LOCATION.lat, longitude: USER_LOCATION.lng }} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.userHalo}><View style={styles.userDot} /></View>
            </Marker>

            {lista.map((p) => {
              const on = p.id === pontoId;
              const cor = p.livre ? colors.statusCharging : colors.statusIdle;
              return (
                <Marker
                  key={p.id}
                  coordinate={{ latitude: p.lat, longitude: p.lng }}
                  anchor={{ x: 0.5, y: 1 }}
                  onPress={() => focarPonto(p)}
                  tracksViewChanges
                >
                  <View style={[styles.pinWrap, on && { transform: [{ scale: 1.08 }] }]}>
                    {on ? (
                      <LinearGradient colors={[colors.red400, colors.red600]} style={[styles.pinBubble, styles.pinBubbleOn]}>
                        <Icon name="zap" size={13} color={colors.textOnAccent} strokeWidth={2.6} />
                        <Text style={[styles.pinText, { color: colors.textOnAccent }]}>R$ {p.tarifa.toFixed(2).replace('.', ',')}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.pinBubble}>
                        <Icon name="zap" size={13} color={cor} strokeWidth={2.6} />
                        <Text style={styles.pinText}>R$ {p.tarifa.toFixed(2).replace('.', ',')}</Text>
                      </View>
                    )}
                    <View style={[styles.pinTip, { backgroundColor: on ? colors.accent : cor }]} />
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {/* Busca + chips flutuantes */}
          <View style={styles.overlayTop} pointerEvents="box-none">
            <Animated.View entering={FadeInDown.duration(320).easing(motion.easeSheet)} style={{ flexDirection: 'row', gap: 8 }}>
              <View style={styles.search}>
                <Icon name="search" size={17} color={colors.textDisabled} />
                <TextInput
                  placeholder="Endereço, condomínio ou vaga"
                  placeholderTextColor={colors.textDisabled}
                  style={styles.searchInput}
                />
              </View>
              <Press
                scaleTo={0.92}
                onPress={() => mapRef.current?.animateToRegion({
                  latitude: USER_LOCATION.lat, longitude: USER_LOCATION.lng,
                  latitudeDelta: 0.008, longitudeDelta: 0.008,
                }, 420)}
                style={styles.locateBtn}
              >
                <Icon name="locate-fixed" size={20} color={colors.textTitle} />
              </Press>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(320).delay(60).easing(motion.easeSheet)}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                {CHIPS.map((c) => (
                  <Chip key={c.id} label={c.label} active={filtro === c.id} onPress={() => setFiltro(c.id)} />
                ))}
              </ScrollView>
            </Animated.View>
          </View>

          {/* Prévia do ponto selecionado */}
          <Animated.View
            key={selecionado.id}
            entering={FadeInUp.duration(280).easing(motion.easeSheet)}
            style={[styles.preview, { paddingBottom: insets.bottom + 86 }]}
          >
            <View style={styles.grabber} />
            <Press onPress={() => router.push(`/ponto/${selecionado.id}`)} scaleTo={0.99}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={styles.cardIcon}>
                  <Icon name="plug-zap" size={22} color={selecionado.livre ? colors.statusCharging : colors.statusIdle} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.cardName}>{selecionado.nome}</Text>
                  <Text style={styles.cardLocal}>{selecionado.local}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cardTarifa}>R$ {selecionado.tarifa.toFixed(2).replace('.', ',')}</Text>
                  <Text style={styles.cardUnit}>por kWh</Text>
                </View>
              </View>
            </Press>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 14 }}>
              <StatusPill status={selecionado.livre ? 'available' : 'idle'}>
                {selecionado.livre ? 'Livre' : 'Ocupado'}
              </StatusPill>
              <Text style={styles.cardMeta}>{selecionado.meta}</Text>
            </View>
            <Button variant="primary" size="lg" block haptic icon="zap" onPress={() => router.push(`/ponto/${selecionado.id}`)}>
              {selecionado.livre ? 'Ver ponto e continuar' : 'Ver ponto e entrar na fila'}
            </Button>
            <Text style={styles.previewFootnote}>
              {selecionado.regime === 'A'
                ? 'Grupo A · energia repassada a custo, sem margem'
                : 'Grupo B · tarifa dinâmica · NFS-e'}
            </Text>
          </Animated.View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listBody, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.search}>
            <Icon name="search" size={17} color={colors.textDisabled} />
            <TextInput
              placeholder="Endereço, condomínio ou vaga"
              placeholderTextColor={colors.textDisabled}
              style={styles.searchInput}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {CHIPS.map((c) => (
              <Chip key={c.id} label={c.label} active={filtro === c.id} onPress={() => setFiltro(c.id)} />
            ))}
          </ScrollView>
          {lista.map((p, i) => (
            <Animated.View key={p.id} entering={FadeInDown.duration(300).delay(40 * i).easing(motion.easeSheet)}>
              <PontoCard
                p={p}
                selected={p.id === pontoId}
                onPress={() => { setPontoId(p.id); router.push(`/ponto/${p.id}`); }}
              />
            </Animated.View>
          ))}
          <Text style={styles.legal}>
            Preço estimado por ponto. Em condomínio a energia é repassada a custo · ANEEL RN 1.000/2021.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },

  overlayTop: { position: 'absolute', top: 12, left: 16, right: 16, gap: 8 },
  search: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 52,
    paddingHorizontal: 14, borderRadius: radius.input,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: fonts.semibold, color: colors.textTitle, paddingVertical: 0 },
  locateBtn: {
    width: 52, height: 52, borderRadius: radius.input,
    backgroundColor: colors.surfaceInset, alignItems: 'center', justifyContent: 'center',
  },

  chip: {
    height: 36, paddingHorizontal: 14, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfaceCard,
    alignItems: 'center', justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.surfaceInset, borderColor: 'transparent' },
  chipLabel: { fontSize: 13, fontFamily: fonts.bold, color: colors.textSubtle },
  chipLabelOn: { color: colors.textTitle },

  userHalo: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.statusInfoBg,
    alignItems: 'center', justifyContent: 'center',
  },
  userDot: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: colors.statusInfo,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },

  pinWrap: { alignItems: 'center', gap: 4, paddingBottom: 4 },
  pinBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
    backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderSubtle,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pinBubbleOn: {
    borderWidth: 0,
    shadowColor: colors.accent, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  pinText: { fontSize: 12, fontFamily: fonts.extrabold, color: colors.textTitle },
  pinTip: {
    width: 8, height: 8, borderRadius: 4,
    shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },

  preview: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: colors.surfaceSheet,
    borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet,
    paddingHorizontal: 16, paddingTop: 10,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 20,
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderSubtle, alignSelf: 'center', marginBottom: 14 },
  previewFootnote: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSubtle, textAlign: 'center', marginTop: 8 },

  listBody: { paddingHorizontal: 16, gap: 12 },
  card: {
    padding: 14, borderRadius: radius.card, backgroundColor: colors.surfaceCard,
    borderWidth: 1, borderColor: 'transparent',
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: radius.tile,
    backgroundColor: colors.surfaceInset, alignItems: 'center', justifyContent: 'center',
  },
  cardName: { fontSize: 16, fontFamily: fonts.bold, color: colors.textTitle },
  cardLocal: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSubtle, marginTop: 2 },
  cardTarifa: { fontSize: 18, fontFamily: fonts.extrabold, color: colors.textTitle },
  cardUnit: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSubtle },
  cardMeta: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textSubtle, flexShrink: 1 },
  legal: { fontSize: 11, lineHeight: 16, fontFamily: fonts.medium, color: colors.textDisabled, textAlign: 'center', paddingHorizontal: 12, paddingTop: 4 },
});
