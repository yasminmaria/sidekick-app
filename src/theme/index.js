// ============================================================
// Sidekick design tokens — "Calm forest" green system
// Mirrors the Figma redesign (primary #0F6E56, accent #17E375).
// All historical token keys are preserved so existing screens
// and components keep working; values are retuned to the new look.
// ============================================================

export const darkColors = {
  primary: '#1D9E75',
  primaryDark: '#5CDBB7',
  primaryLight: '#0F3A2D',
  brightGreen: '#17E375',
  mint: '#9FE1CB',
  teal: '#1D9E75',
  tealLight: '#0D2820',
  tealDark: '#5CDBB7',
  tealMid: '#1D9E75',
  tealAccent: '#1A3A2E',
  calendarTodayBg: '#0A2015',
  pink: '#E2729A',
  pinkDark: '#E2729A',
  pinkLight: '#2A0A18',
  pinkTint: '#2A0A18',
  amber: '#EFA436',
  amberDark: '#D98A12',
  amberLight: '#231800',
  amberTint: '#231800',
  amberText: '#FFD080',
  streakGold: '#FAC775',
  coral: '#D2733E',
  coralLight: '#231006',
  coralTint: '#231006',
  background: '#0E1512',
  surface: '#18211C',
  // Sunken/recessed layer — must sit BELOW surface (segmented troughs, progress
  // tracks, completed tiles) so raised elements read as lighter, as in light mode.
  surfaceAlt: '#101713',
  border: '#26302B',
  borderSoft: '#212B26',
  borderSofter: '#1C2520',
  checkBorder: '#33403A',
  dashedBorder: '#39463F',
  dividerGreen: '#212B26',
  textPrimary: '#EAF1EC',
  textStrong: '#F2F7F3',
  textSecondary: '#9AA8A0',
  textMuted: '#8E9A91',
  textFaint: '#8E9A91',
  textLight: '#8E9A91',
  decorAsh: '#5A6560',
  decorAshFaint: '#4A554F',
  cardDark: '#0E1A16',
  success: '#34D97A',
  coralText: '#FF9980',
  xpColor: '#5CDBB7',
}

export const colors = {
  // Brand
  primary: '#0F6E56',
  primaryDark: '#0B6450',
  primaryLight: '#E1F5EE',
  brightGreen: '#17E375',
  mint: '#9FE1CB',
  teal: '#1D9E75',
  tealLight: '#E1F5EE',
  tealDark: '#0B6450',
  tealMid: '#0F6E56',
  tealAccent: '#9FE1CB',
  calendarTodayBg: '#E1F5EE',
  // Accents
  pink: '#D4537E',
  pinkDark: '#B23866',
  pinkLight: '#FBEAF0',
  pinkTint: '#FBEAF0',
  amber: '#EFA436',
  amberDark: '#D98A12',
  amberLight: '#FAEEDA',
  amberTint: '#FAEEDA',
  amberText: '#9A6312',
  streakGold: '#EFA436',
  coral: '#D2733E',
  coralLight: '#FBEADD',
  coralTint: '#FBEADD',
  // Surfaces
  background: '#F4F7F4',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1EE',
  border: '#EBEEEB',
  borderSoft: '#EEF1EE',
  borderSofter: '#F0F2F0',
  // Empty-control outlines (unchecked checkbox / dose pill) and dashed "add" buttons.
  checkBorder: '#DCE2DD',
  dashedBorder: '#CBD4CC',
  dividerGreen: '#EEF1EE',
  // Text
  textPrimary: '#0E1A16',
  textStrong: '#15201B',
  // Text ramp — every token here carries words, so all clear WCAG AA (>=4.5:1)
  // on white, canvas (#F4F7F4), and sunken (#EEF1EE). The lightest grays
  // (#A2ABA4 / #B4BDB5) are demoted to decorative-only: see `decorAsh`.
  textSecondary: '#5C6A62',
  textMuted: '#647067',
  textFaint: '#647067',
  textLight: '#647067',
  // Decorative, NON-TEXT only — empty track tints, dots, inactive heatmap cells.
  decorAsh: '#A2ABA4',
  decorAshFaint: '#B4BDB5',
  cardDark: '#0E1A16',
  // Semantic
  success: '#0F6E56',
  coralText: '#B23866',
  xpColor: '#0F6E56',
}

// Colored "tint tiles" used for task / habit / med / journey icons.
export const tints = {
  teal: { bg: '#E1F5EE', fg: '#0F6E56' },
  amber: { bg: '#FAEEDA', fg: '#9A6312' },
  pink: { bg: '#FBEAF0', fg: '#B23866' },
  dark: { bg: '#0E1A16', fg: '#9FE1CB' },
}

export function tint(key) {
  return tints[key] || tints.teal
}

// Dark-mode tints: deep brand-tinted tile backgrounds with bright foregrounds,
// so the icon tiles read on a near-black surface instead of glowing.
export const tintsDark = {
  teal: { bg: '#103A2C', fg: '#5CDBB7' },
  amber: { bg: '#352812', fg: '#F0B760' },
  pink: { bg: '#351521', fg: '#E892B0' },
  dark: { bg: '#243029', fg: '#9FE1CB' },
}

export function tintFor(isDark, key) {
  const t = isDark ? tintsDark : tints
  return t[key] || t.teal
}

// Gradient stop arrays (consumed by <GradientView />).
export const gradients = {
  header: ['#0F6E56', '#14805F'],
  headerVivid: ['#1D9E75', '#0F6E56'],
  focus: ['#163A2E', '#0E1A16'],
  xpBar: ['#17E375', '#9FE1CB'],
  progress: ['#17E375', '#0F6E56'],
  homeButton: ['#1D9E75', '#0F6E56'],
  avatar: ['#17E375', '#0B6450'],
}

// Gradient goal cards (Objetivos / Metas).
export const goalGradients = {
  amber: {
    colors: ['#EFA436', '#D98A12'],
    fg: '#FFFFFF',
    sub: 'rgba(255,255,255,0.82)',
    chip: 'rgba(255,255,255,0.24)',
    bar: '#FFFFFF',
    track: 'rgba(255,255,255,0.3)',
    checkColor: '#D98A12',
  },
  dark: {
    colors: ['#21392E', '#0E1A16'],
    fg: '#FFFFFF',
    sub: 'rgba(255,255,255,0.62)',
    chip: 'rgba(255,255,255,0.12)',
    bar: '#5DCAA5',
    track: 'rgba(255,255,255,0.14)',
    checkColor: '#0E1A16',
  },
  teal: {
    colors: ['#159C73', '#0B6450'],
    fg: '#FFFFFF',
    sub: 'rgba(255,255,255,0.74)',
    chip: 'rgba(255,255,255,0.18)',
    bar: '#9FE1CB',
    track: 'rgba(255,255,255,0.2)',
    checkColor: '#0B6450',
  },
}

// Map a goal's stored prazo to one of the gradient styles.
export const goalColorByPrazo = { curto: 'amber', medio: 'teal', longo: 'dark' }

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radii = {
  sm: 7,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
}

export const shadows = {
  card: {
    shadowColor: '#0E1A16',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0E1A16',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
  },
}

export const typography = {
  h1: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.4 },
  h3: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  body: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
}
