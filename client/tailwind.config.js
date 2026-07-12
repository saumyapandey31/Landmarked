/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // These read from CSS custom properties (defined per-theme in
        // index.css) instead of hardcoded hex, so switching [data-theme]
        // on <html> restyles the whole app without touching components.
        bg: {
          primary: 'rgb(var(--c-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--c-bg-secondary) / <alpha-value>)',
        },
        accent: {
          primary: 'rgb(var(--c-accent-primary) / <alpha-value>)',
          secondary: 'rgb(var(--c-accent-secondary) / <alpha-value>)',
          highlight: 'rgb(var(--c-accent-highlight) / <alpha-value>)',
        },
        card: 'rgb(var(--c-card) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        sage: '#A8C3A0',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        sand: {
          DEFAULT: '#EDE3D0',
          light: '#F7F2E7',
          dark: '#D9C9A8',
        },
        gold: {
          DEFAULT: '#C9A15A',
          light: '#E3C98A',
          dark: '#A87F3C',
        },
        brown: {
          DEFAULT: '#5A4130',
          light: '#7A5A40',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 24px 60px -20px rgba(15, 61, 46, 0.16)',
        card: '0 10px 30px -12px rgba(15, 61, 46, 0.12)',
        glow: '0 0 0 1px rgba(15, 61, 46, 0.05)',
        gold: '0 8px 24px -8px rgba(212, 163, 115, 0.35)',
      },
      backgroundImage: {
        'deep-gradient': 'linear-gradient(165deg, #0B2E22 0%, #0F3D2E 45%, #1B4E3A 100%)',
        'card-glass': 'linear-gradient(155deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #E3C98A 0%, #C9A15A 55%, #A87F3C 100%)',
      },
    },
  },
  plugins: [],
};
