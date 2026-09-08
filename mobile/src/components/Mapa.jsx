import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';
import Icon from './Icon';
import { darkMapStyle } from '../theme/mapStyle';
import { colors, fonts, radius } from '../theme/tokens';
import { USER_LOCATION } from '../state/AppState';

const preco = (t) => `R$ ${t.toFixed(2).replace('.', ',')}`;

const Mapa = forwardRef(function Mapa({ pontos, pontoId, onSelecionar }, ref) {
  return (
    <MapView
      ref={ref}
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
      <Marker coordinate={{ latitude: USER_LOCATION.lat, longitude: USER_LOCATION.lng }} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.userHalo}><View style={styles.userDot} /></View>
      </Marker>

      {pontos.map((p) => {
        const on = p.id === pontoId;
        const cor = p.livre ? colors.statusCharging : colors.statusIdle;
        return (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => onSelecionar(p)}
            tracksViewChanges
          >
            <View style={[styles.pinWrap, on && { transform: [{ scale: 1.08 }] }]}>
              {on ? (
                <LinearGradient colors={[colors.red400, colors.red600]} style={[styles.pinBubble, styles.pinBubbleOn]}>
                  <Icon name="zap" size={13} color={colors.textOnAccent} strokeWidth={2.6} />
                  <Text style={[styles.pinText, { color: colors.textOnAccent }]}>{preco(p.tarifa)}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.pinBubble}>
                  <Icon name="zap" size={13} color={cor} strokeWidth={2.6} />
                  <Text style={styles.pinText}>{preco(p.tarifa)}</Text>
                </View>
              )}
              <View style={[styles.pinTip, { backgroundColor: on ? colors.accent : cor }]} />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
});

export default Mapa;

const styles = StyleSheet.create({
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
});
