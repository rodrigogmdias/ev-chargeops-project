// EV ChargeOps design tokens — ported from the Claude Design system
// (_ds/ev-chargeops-design-system/tokens/*.css). Dark-first: the product ships dark.
import { Easing } from 'react-native-reanimated';

export const colors = {
  // Base neutrals
  neutral1000: '#000000',
  neutral950: '#0B0B0D',
  neutral900: '#121214',
  neutral850: '#17171A',
  neutral800: '#1C1C1F',
  neutral750: '#212125',
  neutral700: '#26262A',
  neutral600: '#303036',
  neutral500: '#3D3D44',
  neutral400: '#57575E',
  neutral300: '#7C7C84',
  neutral200: '#B4B4BA',
  neutral100: '#DEDEE2',
  neutral0: '#FFFFFF',

  // Brand red
  red700: '#9E0014',
  red600: '#C10015',
  red500: '#E8121F',
  red400: '#FF3B45',
  red300: '#FF7A80',
  redTint: 'rgba(232,18,31,0.14)',

  // Energy / status hues
  green500: '#26D07C',
  green400: '#4FE09B',
  greenTint: 'rgba(38,208,124,0.14)',
  amber500: '#F5A623',
  amberTint: 'rgba(245,166,35,0.14)',
  blue500: '#4A90E2',
  blue400: '#6BA9EE',
  blueTint: 'rgba(74,144,226,0.16)',
  violet500: '#8E7BE8',

  // Semantic surfaces
  bgBase: '#0B0B0D',
  bgCanvas: '#121214',
  surfaceCard: '#1C1C1F',
  surfaceInset: '#26262A',
  surfaceRaised: '#303036',
  surfaceNav: 'rgba(18,18,20,0.86)',
  surfaceSheet: '#17171A',
  surfaceScrim: 'rgba(0,0,0,0.62)',

  // Semantic text
  textTitle: '#FFFFFF',
  textBody: '#DEDEE2',
  textMuted: '#B4B4BA',
  textSubtle: '#7C7C84',
  textDisabled: '#57575E',
  textOnAccent: '#FFFFFF',
  textLink: '#FF3B45',

  // Lines
  hairline: 'rgba(255,255,255,0.07)',
  borderSubtle: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.26)',
  borderDashed: 'rgba(255,255,255,0.18)',
  focusRing: 'rgba(232,18,31,0.55)',

  // Accents
  accent: '#E8121F',
  accentHover: '#FF3B45',
  accentPress: '#C10015',
  accentQuiet: 'rgba(232,18,31,0.14)',
  accentOnQuiet: '#FF3B45',
  borderDanger: 'rgba(232,18,31,0.40)',

  // Status roles
  statusCharging: '#26D07C',
  statusChargingBg: 'rgba(38,208,124,0.14)',
  statusIdle: '#F5A623',
  statusIdleBg: 'rgba(245,166,35,0.14)',
  statusFault: '#FF3B45',
  statusFaultBg: 'rgba(232,18,31,0.14)',
  statusInfo: '#4A90E2',
  statusInfoBg: 'rgba(74,144,226,0.16)',
  statusOffline: '#7C7C84',
  statusOfflineBg: 'rgba(255,255,255,0.08)',

  // Meters
  meterTrack: 'rgba(255,255,255,0.10)',
  meterEnergy: '#26D07C',
  meterDemand: '#F5A623',
  meterOver: '#FF3B45',

  // Controls
  controlTrackOff: '#303036',
  controlTrackOn: '#E8121F',
  controlKnob: '#FFFFFF',

  // Map stand-ins
  island: '#000000',
  mapBase: '#121214',
  mapInk: '#17171A',
  pinHalo: 'rgba(0,0,0,0.45)',
};

export const spacing = {
  s1: 2, s2: 4, s3: 8, s4: 12, s5: 16, s6: 20, s7: 24, s8: 32, s9: 40, s10: 48, s11: 64,
  gutter: 16,       // mobile screen side padding
  cardPad: 16,      // card inner padding
  gapCard: 12,      // between stacked cards
  tabbarHeight: 64,
  appbarHeight: 56,
  hitTarget: 44,
};

export const radius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999,
  card: 16,
  tile: 14,
  input: 12,
  sheet: 20,
};

export const fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
};

// Type scale — weight carries the hierarchy, not size jumps
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: fonts.extrabold, letterSpacing: -0.4, color: colors.textTitle },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold, letterSpacing: -0.2, color: colors.textTitle },
  heading: { fontSize: 19, lineHeight: 26, fontFamily: fonts.bold, color: colors.textTitle },
  subtitle: { fontSize: 17, lineHeight: 24, fontFamily: fonts.semibold, color: colors.textTitle },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fonts.regular, color: colors.textBody },
  label: { fontSize: 14, lineHeight: 20, fontFamily: fonts.semibold, color: colors.textBody },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.medium, color: colors.textSubtle },
  micro: { fontSize: 11, lineHeight: 14, fontFamily: fonts.semibold, color: colors.textSubtle },
  eyebrow: {
    fontSize: 11, lineHeight: 14, fontFamily: fonts.extrabold,
    letterSpacing: 0.9, textTransform: 'uppercase', color: colors.textSubtle,
  },
};

// Motion — short and flat, no bounce anywhere
export const motion = {
  instant: 80,
  fast: 140,
  base: 200,
  slow: 320,
  sheet: 280,
  easeStandard: Easing.bezier(0.2, 0, 0.2, 1),
  easeOut: Easing.bezier(0, 0, 0.2, 1),
  easeIn: Easing.bezier(0.4, 0, 1, 1),
  easeSheet: Easing.bezier(0.16, 1, 0.3, 1),
  pressScale: 0.97,
};

export const fmt = (n, d = 2) =>
  Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
