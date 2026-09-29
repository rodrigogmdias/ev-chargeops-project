import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from './Icon';
import { colors, fonts, radius, motion } from '../theme/tokens';

const CHAVE = 'evchargeops.dica-instalar';

/**
 * No iOS não existe prompt de instalação: o usuário precisa usar
 * Compartilhar → Adicionar à Tela de Início. Sem um aviso, ninguém descobre
 * que dá para rodar em tela cheia. Some depois de instalado ou dispensado.
 */
export default function InstalarPWA() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const jaInstalado = window.matchMedia?.('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    if (jaInstalado) return;

    let dispensado = false;
    try { dispensado = window.localStorage.getItem(CHAVE) === '1'; } catch { /* modo privado */ }
    if (dispensado) return;

    const ua = window.navigator.userAgent;
    const ehIOS = /iPad|iPhone|iPod/.test(ua);
    const ehSafari = ehIOS && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (!ehSafari) return;

    const t = setTimeout(() => setVisivel(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!visivel) return null;

  const dispensar = () => {
    try { window.localStorage.setItem(CHAVE, '1'); } catch { /* modo privado */ }
    setVisivel(false);
  };

  return (
    <Animated.View entering={FadeInUp.duration(320).easing(motion.easeSheet)} style={styles.base}>
      <View style={styles.icone}>
        <Icon name="share" size={18} color={colors.accentOnQuiet} />
      </View>
      <View style={styles.texto}>
        <Text style={styles.titulo}>Abra em tela cheia</Text>
        <Text style={styles.corpo}>
          Toque em Compartilhar e escolha "Adicionar à Tela de Início" para usar sem a barra do
          navegador.
        </Text>
      </View>
      <Pressable onPress={dispensar} style={styles.fechar} hitSlop={10} accessibilityLabel="Dispensar">
        <Icon name="x" size={18} color={colors.textSubtle} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 50,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderRadius: radius.card,
    backgroundColor: colors.surfaceRaised,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 32, shadowOffset: { width: 0, height: 12 },
  },
  icone: {
    width: 36, height: 36, borderRadius: radius.input, flex: 0,
    backgroundColor: colors.accentQuiet, alignItems: 'center', justifyContent: 'center',
  },
  texto: { flex: 1, minWidth: 0 },
  titulo: { fontSize: 14, fontFamily: fonts.bold, color: colors.textTitle },
  corpo: { fontSize: 12.5, lineHeight: 17, fontFamily: fonts.medium, color: colors.textMuted, marginTop: 2 },
  fechar: { padding: 2 },
});
