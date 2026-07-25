import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        gold: '#D4AF37',
        cyan: '#00BCD4',
        cream: '#F8F9FA',
      },
    },
  },
  plugins: [],
}

export default config
