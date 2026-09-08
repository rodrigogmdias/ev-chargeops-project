import { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { colors, fonts, radius } from '../theme/tokens';

/**
 * O react-native-maps não roda no navegador. Em vez de deixar a tela vazia,
 * a web usa o mapa abstrato do design original — malha, vias e quadras —
 * com os pinos posicionados pelas mesmas coordenadas, normalizadas na área.
 */

const preco = (t) => `R$ ${t.toFixed(2).replace('.', ',')}`;

// Recorte do bairro que enquadra os quatro pontos e a localização do morador.
const AREA = { latMin: -23.5800, latMax: -23.5670, lngMin: -46.6340, lngMax: -46.6240 };

// A busca e os filtros cobrem o topo do mapa, e a prévia do ponto cobre a
// base. Os pinos são projetados só na faixa livre entre os dois.
const FAIXA = { esq: 14, dir: 82, topo: 26, base: 62 };

const entre = (t, a, b) => a + t * (b - a);

const bruto = (lat, lng) => ({
  x: (lng - AREA.lngMin) / (AREA.lngMax - AREA.lngMin),
  // Latitude cresce para o norte, que na tela é para cima: invertido.
  y: (AREA.latMax - lat) / (AREA.latMax - AREA.latMin),
});

/**
 * Os três pontos do condomínio ficam a ~100 m entre si. No mapa nativo o
 * usuário aproxima para distingui-los; aqui não há zoom, então eles se
 * sobrepõem. Esta passagem afasta os pinos até a distância mínima legível,
 * preservando a ordem norte-sul — a geografia relativa continua correta,
 * a escala é que deixa de ser fiel.
 */
const GAP_MIN = 9; // em % da altura, ~ a altura de um pino

function distribuir(pontos) {
  const posicoes = pontos
    .map((p) => {
      const { x, y } = bruto(p.lat, p.lng);
      return { id: p.id, left: entre(x, FAIXA.esq, FAIXA.dir), top: entre(y, FAIXA.topo, FAIXA.base) };
    })
    .sort((a, b) => a.top - b.top);

  for (let i = 1; i < posicoes.length; i++) {
    const anterior = posicoes[i - 1];
    if (posicoes[i].top - anterior.top < GAP_MIN) posicoes[i].top = anterior.top + GAP_MIN;
  }
  return Object.fromEntries(posicoes.map((p) => [p.id, { left: `${p.left}%`, top: `${p.top}%` }]));
}

const Mapa = forwardRef(function MapaWeb({ pontos, pontoId, onSelecionar }, ref) {
  // A tela chama animateToRegion; na web não há o que animar.
  useImperativeHandle(ref, () => ({ animateToRegion: () => {} }), []);

  const posicoes = distribuir(pontos);

  return (
    <View style={styles.base}>
      <View style={styles.malha} pointerEvents="none">
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.linha, { top: i * 58 }]} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.linhaV, { left: i * 58 }]} />
        ))}
      </View>

      <View style={[styles.via, { top: 150, transform: [{ rotate: '-14deg' }] }]} pointerEvents="none" />
      <View style={[styles.via, { top: 360, height: 18, transform: [{ rotate: '6deg' }] }]} pointerEvents="none" />
      <View style={[styles.viaV, { left: 210, transform: [{ rotate: '9deg' }] }]} pointerEvents="none" />
      <View style={[styles.quadra, { left: 40, top: 220, width: 130, height: 96 }]} pointerEvents="none" />
      <View style={[styles.quadra, { left: 255, top: 120, width: 110, height: 120 }]} pointerEvents="none" />

      <View style={[styles.userWrap, { left: `${entre(bruto(-23.56880, -46.63175).x, FAIXA.esq, FAIXA.dir)}%`, top: `${entre(bruto(-23.56880, -46.63175).y, FAIXA.topo, FAIXA.base)}%` }]} pointerEvents="none">
        <View style={styles.userHalo}><View style={styles.userDot} /></View>
      </View>

      {pontos.map((p) => {
        const on = p.id === pontoId;
        const cor = p.livre ? colors.statusCharging : colors.statusIdle;
        return (
          <Pressable
            key={p.id}
            onPress={() => onSelecionar(p)}
            style={[styles.pinAncora, posicoes[p.id]]}
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
          </Pressable>
        );
      })}
    </View>
  );
});

export default Mapa;

const styles = StyleSheet.create({
  base: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.mapBase, overflow: 'hidden' },
  malha: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  linha: { position: 'absolute', left: -40, right: -40, height: 1, backgroundColor: colors.mapInk },
  linhaV: { position: 'absolute', top: -40, bottom: -40, width: 1, backgroundColor: colors.mapInk },
  via: { position: 'absolute', left: -60, width: 520, height: 26, backgroundColor: colors.mapInk },
  viaV: { position: 'absolute', top: -40, width: 20, height: 620, backgroundColor: colors.mapInk },
  quadra: { position: 'absolute', borderRadius: 8, backgroundColor: colors.mapInk, opacity: 0.7 },

  userWrap: { position: 'absolute', marginLeft: -20, marginTop: -20 },
  userHalo: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.statusInfoBg,
    alignItems: 'center', justifyContent: 'center',
  },
  userDot: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: colors.statusInfo,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },

  // O pino aponta com a ponta na coordenada, como no mapa nativo.
  pinAncora: { position: 'absolute', transform: [{ translateX: -40 }, { translateY: -46 }] },
  pinWrap: { alignItems: 'center', gap: 4, paddingBottom: 4 },
  pinBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
    backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderSubtle,
  },
  pinBubbleOn: { borderWidth: 0 },
  pinText: { fontSize: 12, fontFamily: fonts.extrabold, color: colors.textTitle },
  pinTip: { width: 8, height: 8, borderRadius: 4 },
});
