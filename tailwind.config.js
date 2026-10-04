/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-inner)',
        cardSurface: 'var(--bg-card)',
        titleText: 'var(--text-title)',
        bodyText: 'var(--text-body)',
        accentGlow: 'var(--accent-glow)',
        borderSubtle: 'var(--border-subtle)',
        outer: 'var(--bg-outer)',
      },
    },
  },
  plugins: [],
};
