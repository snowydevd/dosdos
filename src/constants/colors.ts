/**
 * Paleta de colores de DosDos.
 *
 * Color principal: coral/naranja cálido — elegido por ser energético y
 * diferenciador frente al rojo de Tinder / violeta de Bumble.
 * Transmite calidez social, perfecto para el concepto "salir en grupo".
 *
 * Criterio de uso:
 *  - primary: CTAs, botones principales, íconos activos
 *  - accent: highlights, badges, notificaciones
 *  - neutral: fondos, texto, separadores
 */
export const colors = {
  primary: {
    50:  '#FFF4F1',
    100: '#FFE4DC',
    200: '#FFC9B8',
    300: '#FFA68F',
    400: '#FF8066',
    DEFAULT: '#FF6B47',
    600: '#F54A22',
    700: '#D03510',
    800: '#A8280C',
    900: '#7D1D09',
  },
  neutral: {
    50:  '#FAFAF9',
    100: '#F5F5F3',
    200: '#E8E8E5',
    300: '#D4D4CF',
    400: '#A8A8A0',
    500: '#737370',
    600: '#525250',
    700: '#3D3D3B',
    800: '#282826',
    900: '#141413',
  },
  accent: {
    DEFAULT: '#FFB830',
    light: '#FFD980',
    dark: '#D98F00',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
