import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1F3A2B',
        'forest-soft': '#263F30',
        'forest-raised': '#284334',
        honey: '#E3A00F',
        'honey-light': '#F2B01E',
        cream: '#F2EBCF',
        paper: '#FBF7E8',
        'paper-deep': '#EEE5CD',
        ink: '#26382B',
        muted: '#596554',
        line: '#D8CFB7',
      },
      fontFamily: {
        display: ['var(--font-fredoka)', 'Trebuchet MS', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
