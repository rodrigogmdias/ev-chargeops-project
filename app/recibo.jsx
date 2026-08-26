import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import AppBar, { IconButton } from '../src/components/AppBar';
import Button from '../src/components/Button';
import InfoBanner from '../src/components/InfoBanner';
import ListRow from '../src/components/ListRow';
import Icon from '../src/components/Icon';
import { Card, SectionTitle } from '../src/components/Card';
import { colors, fonts, motion, fmt } from '../src/theme/tokens';
import { useApp, CARTOES_INICIAIS } from '../src/state/AppState';

const enter = (i) => FadeInDown.duration(320).delay(60 + 50 * i).easing(motion.easeSheet);

export default function Recibo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessao: s, ponto: p, cartaoId, cartoes, resetSessao } = useApp();

  const grupoA = p.regime === 'A';
  const custo = s.kwh * p.tarifa;
  const multaMin = Math.floor(s.multaSecs / 60);
  const multa = multaMin * 0.25;
  const total = custo + multa;
  const cartao = cartoes.find((c) => c.id === cartaoId) || CARTOES_INICIAIS[0];
  const ultimos4 = cartao.numero.slice(-4);

  const voltar = () => {
    resetSessao();
    router.navigate('/(tabs)/buscar');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppBar variant="modal" title="Recibo" onBack={voltar} actions={<IconButton icon="share-2" onPress={() => {}} />} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 20 }}>
          <Animated.View entering={ZoomIn.duration(320).easing(motion.easeSheet)} style={styles.check}>
            <Icon name="circle-check" size={30} color={colors.statusCharging} />
          </Animated.View>
          <Animated.View entering={enter(0)} style={{ alignItems: 'center' }}>
            <Text style={styles.cobradoLabel}>Cobrado no cartão</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <Text style={styles.cifra}>R$</Text>
              <Text style={styles.total}>{fmt(total)}</Text>
            </View>
            <Text style={styles.sessId}>SESS-2026-08-25-0042</Text>
          </Animated.View>
        </View>

        <Animated.View entering={enter(1)}>
          <Card padding={0}>
            <ListRow
              label="Energia medida"
              value={`${fmt(s.kwh)} kWh · R$ ${fmt(custo)}`}
              hint={`R$ ${fmt(p.tarifa)} por kWh · tarifa travada no início`}
            />
            <ListRow
              label="Taxa de ocupação"
              value={multa > 0 ? `R$ ${fmt(multa)}` : '—'}
              hint={multa > 0 ? `${multaMin} min excedentes × R$ 0,25` : 'Veículo retirado dentro da tolerância'}
            />
            <ListRow
              label={grupoA ? 'Taxa de acesso' : 'Documento fiscal'}
              value={grupoA ? 'R$ 35,00 / mês' : 'NFS-e'}
              hint={grupoA ? 'Rateio da infraestrutura do ponto' : 'Emitida ao encerrar a sessão'}
            />
            <ListRow
              label="Pré-autorização liberada"
              value={`R$ ${fmt(Math.max(0, p.preAut - custo - multa))}`}
              hint="Volta ao limite do cartão em até 7 dias"
              divider={false}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <InfoBanner tone={grupoA ? 'success' : 'info'} title={grupoA ? 'Grupo A · condomínio' : 'Grupo B · rede comercial'}>
            {grupoA
              ? 'Energia a custo, sem margem. A taxa de acesso e a taxa de ocupação entram no boleto condominial da unidade 42.'
              : 'Tarifa dinâmica aplicada e travada no início da sessão. NFS-e emitida com ICMS destacado — RC 31007/2024.'}
          </InfoBanner>
        </Animated.View>

        <Animated.View entering={enter(3)} style={{ gap: 10 }}>
          <SectionTitle>Detalhes técnicos</SectionTitle>
          <Card padding={0}>
            <ListRow label="Ponto" value={p.nome} />
            <ListRow label="Início · fim" value="20:58 · 22:20" />
            <ListRow label="Potência média" value="6.1 kW" hint="Reduzida pelo balanceamento do prédio" />
            <ListRow label="Cartão" value={`•••• ${ultimos4}`} divider={false} />
          </Card>
        </Animated.View>

        <Animated.View entering={enter(4)} style={{ flexDirection: 'row', gap: 12 }}>
          <Button variant="outline" size="md" icon="file-down" style={{ flex: 1 }} onPress={() => {}}>PDF</Button>
          <Button variant="outline" size="md" icon="triangle-alert" style={{ flex: 1 }} onPress={() => {}}>Contestar</Button>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button variant="primary" size="lg" block haptic icon="house" onPress={voltar}>
          Voltar ao início
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  check: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.statusChargingBg,
    alignItems: 'center', justifyContent: 'center',
  },
  cobradoLabel: { fontSize: 13, fontFamily: fonts.semibold, color: colors.textSubtle },
  cifra: { fontSize: 15, fontFamily: fonts.bold, color: colors.textSubtle },
  total: {
    fontSize: 38, lineHeight: 42, fontFamily: fonts.bold, letterSpacing: -0.6,
    color: colors.textTitle, fontVariant: ['tabular-nums'],
  },
  sessId: { fontFamily: fonts.mono, fontSize: 11, color: colors.textDisabled, marginTop: 8 },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: colors.surfaceSheet,
    shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
});
