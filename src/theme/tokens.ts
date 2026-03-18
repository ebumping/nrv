/**
 * NRV Design Tokens
 * Futuristic HUD/LCARS-style theme system + NERV Authentic palette
 */

export const colors = {
  // ═══════════════════════════════════════════════════════════════════════
  // NERV AUTHENTIC PALETTE - Evangelion UI (BLACK/WHITE/RED + accents)
  // ═══════════════════════════════════════════════════════════════════════
  nerv: {
    orange: '#FF6600',
    red: '#CC0000',
    green: '#00FF66',
    cyan: '#00CCFF',
    magenta: '#FF00CC',
    blue: '#0066FF',
    yellow: '#CCCC00',
    amber: '#FFAA00',
    
    // Backgrounds
    bg: '#000000',
    bgElevated: '#0A0A0A',
    bgPanel: '#0F0F0F',
    
    // Text
    textBright: '#FFFFFF',
    textNormal: '#CCCCCC',
    textDim: '#666666',
  },
  
  // Backgrounds (legacy)
  bg: {
    primary: '#050505',
    secondary: '#0a0a0a',
    tertiary: '#111111',
    elevated: '#1a1a1a',
  },
  
  // LCARS Palette (Star Trek inspired)
  lcars: {
    orange: '#FF9900',
    orangeLight: '#FFB84D',
    orangeDark: '#CC7A00',
    gold: '#FFCC00',
    purple: '#996699',
    purpleLight: '#BB88BB',
    salmon: '#CC6666',
    salmonLight: '#DD8888',
    blue: '#6699CC',
    blueLight: '#88BBEE',
    pink: '#CC99CC',
    tan: '#CCAA77',
  },
  
  // HUD/Tactical Palette
  hud: {
    green: '#7CBA6B',
    greenLight: '#A3D98D',
    greenDark: '#5A8A4D',
    red: '#D32F2F',
    redLight: '#EF5350',
    amber: '#FFA000',
    amberLight: '#FFB74D',
    cyan: '#00BCD4',
    cyanLight: '#4DD0E1',
    white: '#FFFFFF',
    whiteDim: '#AAAAAA',
  },
  
  // Semantic colors
  semantic: {
    success: '#7CBA6B',
    warning: '#FFA000',
    error: '#D32F2F',
    info: '#00BCD4',
  },
} as const;

export const typography = {
  fonts: {
    mono: '"JetBrains Mono", "Roboto Mono", "Share Tech Mono", monospace',
    condensed: '"Roboto Condensed", "Archivo Narrow", "Swiss 911", sans-serif',
    display: '"Orbitron", "Exo 2", sans-serif',
    body: '"Inter", "Roboto", sans-serif',
  },
  
  sizes: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '22px',
    '3xl': '28px',
    '4xl': '36px',
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  letterSpacing: {
    tight: '0.5px',
    normal: '1px',
    wide: '2px',
    wider: '3px',
  },
} as const;

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const radii = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
  // LCARS specific
  elbow: '20px 0 0 0',
  elbowInverse: '0 0 20px 0',
  pill: '100px',
} as const;

export const shadows = {
  none: 'none',
  glow: {
    orange: '0 0 20px rgba(255, 153, 0, 0.4)',
    green: '0 0 20px rgba(124, 186, 107, 0.4)',
    red: '0 0 20px rgba(211, 47, 47, 0.4)',
    cyan: '0 0 20px rgba(0, 188, 212, 0.4)',
  },
  scanline: `
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    )
  `,
} as const;

export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  animation,
} as const;

export type Theme = typeof theme;
