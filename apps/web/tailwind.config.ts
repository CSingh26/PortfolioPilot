import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1320',
        muted: '#5B6472',
        surface: '#FFFFFF',
        canvas: '#F6F7FB',
        border: '#E4E8F0',
        accent: '#1E3A8A',
        accentSoft: '#E6ECF8'
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: [typography]
};

export default config;
