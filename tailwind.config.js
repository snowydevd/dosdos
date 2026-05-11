/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta DosDos — naranja/coral cálido como color principal
        primary: {
          50:  '#FFF4F1',
          100: '#FFE4DC',
          200: '#FFC9B8',
          300: '#FFA68F',
          400: '#FF8066',
          DEFAULT: '#FF6B47', // coral principal
          600: '#F54A22',
          700: '#D03510',
          800: '#A8280C',
          900: '#7D1D09',
        },
        // Neutros cálidos para fondos y texto
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
        // Acento secundario — amarillo cálido para highlights
        accent: {
          DEFAULT: '#FFB830',
          light: '#FFD980',
          dark: '#D98F00',
        },
        // Semánticos
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },
  plugins: [],
};
