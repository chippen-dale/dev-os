import type { Config } from 'tailwindcss'

// Tokens sourced from docs/design.md (allNeurons design system).
// Blue = brand/info, Green = success, Red = danger, Yellow = warning.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#115ACB', // ★500
          50: '#E7EFFC',
          100: '#B6CFF5',
          200: '#92B7F0',
          300: '#6196EA',
          400: '#89B7FF',
          500: '#115ACB',
          600: '#0044AE',
          700: '#0D469E',
          800: '#0A367B',
          900: '#082A5E',
        },
        gray: {
          25: '#FAFAFA',
          50: '#F0F0F1',
          100: '#DADADB',
          200: '#C1C2C3',
          300: '#8F9193',
          400: '#5E6062',
          500: '#4A4C4F',
          600: '#2C2F32',
          700: '#25272B',
          800: '#151719',
          900: '#070A0E',
        },
        ink: {
          DEFAULT: '#070A0E', // primary text
          secondary: '#4A4C4F', // secondary text
        },
        success: { DEFAULT: '#13A10E', 50: '#E7F6E7', 200: '#92D490', 700: '#0D720A' },
        danger: { DEFAULT: '#D13438', 50: '#FAEBEB', 200: '#EAA2A3', 700: '#942528' },
        warning: { DEFAULT: '#FFAA33', 50: '#FFF9F0', 200: '#FFE3BD', 800: '#B36800' },
      },
      fontFamily: {
        sans: ['Inter Display', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '56px', fontWeight: '700' }],
        h1: ['48px', { lineHeight: '56px', fontWeight: '700' }],
        h2: ['36px', { lineHeight: '44px', fontWeight: '700' }],
        h3: ['30px', { lineHeight: '38px', fontWeight: '600' }],
        h5: ['24px', { lineHeight: '32px', fontWeight: '500' }],
        body: ['16px', { lineHeight: '24px' }],
        caption: ['12px', { lineHeight: '18px' }],
      },
      borderRadius: {
        badge: '4px',
        btn: '6px',
        input: '6px',
        card: '8px',
        modal: '12px',
      },
      letterSpacing: { normal: '0' },
    },
  },
  plugins: [],
}

export default config
