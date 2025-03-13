/**
 * A modern, clean color palette and theme tokens for AcneApp
 * Following principles of clarity, simplicity, and deference to content
 */

// Primary brand colors
const primaryLight = '#4A90E2'; // Modern blue
const primaryDark = '#60A5FA';

// Secondary accent colors
const accentLight = '#5D58C5'; // Purple
const accentDark = '#7C78DD';

// Success/error states
const successLight = '#34C759';
const successDark = '#30D158';
const errorLight = '#FF3B30';
const errorDark = '#FF453A';

// Neutral tones
const neutralLight = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
};

const neutralDark = {
  50: '#292929',
  100: '#333333',
  200: '#404040',
  300: '#4D4D4D',
  400: '#666666',
  500: '#8C8C8C',
  600: '#ADADAD',
  700: '#CFCFCF',
  800: '#E8E8E8',
  900: '#F5F5F5',
};

// Shadows
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Border radius tokens
const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  circle: 9999,
};

// Spacing tokens
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Font styles
const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const Colors = {
  light: {
    text: neutralLight[900],
    textSecondary: neutralLight[600],
    background: neutralLight[50],
    card: '#FFFFFF',
    tint: primaryLight,
    accent: accentLight,
    success: successLight,
    error: errorLight,
    icon: neutralLight[600],
    tabIconDefault: neutralLight[400],
    tabIconSelected: primaryLight,
    border: neutralLight[200],
    notification: errorLight,
    pressable: neutralLight[100],
  },
  dark: {
    text: neutralDark[900],
    textSecondary: neutralDark[600],
    background: '#000000',
    card: neutralDark[50],
    tint: primaryDark,
    accent: accentDark,
    success: successDark,
    error: errorDark,
    icon: neutralDark[600],
    tabIconDefault: neutralDark[400],
    tabIconSelected: primaryDark,
    border: neutralDark[200],
    notification: errorDark,
    pressable: neutralDark[100],
  },
};

export const Theme = {
  colors: Colors,
  shadows,
  borderRadius,
  spacing,
  typography: {
    fontSizes,
    fontWeights,
  },
};
