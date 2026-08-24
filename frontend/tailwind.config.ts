import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#09090d',
          900: '#101017',
          800: '#17151f',
        },
        rose: {
          halo: '#ff7abb',
          pulse: '#ff2f86',
          petal: '#ff9fd0',
        },
        gold: {
          soft: '#ffc95d',
          deep: '#a8740f',
        },
        cream: {
          veil: '#fff2f8',
          muted: '#d7c6cf',
        },
        glass: {
          fill: 'rgba(255, 230, 242, 0.12)',
          line: 'rgba(255, 178, 218, 0.32)',
        },
      },
      boxShadow: {
        glow: '0 22px 80px rgba(255, 47, 134, 0.18)',
        card: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 20px 70px rgba(0,0,0,0.45)',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
