/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette adapted from the Serova reference design.
        canvas: '#f0eae2',
        surface: '#f8f4ef',
        sand: '#e4d9cc',
        blush: '#ebcdbf',
        ink: '#2a1511',
        espresso: '#3a1a15',
        deep: '#26110d',
        coral: { DEFAULT: '#e0583e', dark: '#b8432c', soft: '#f6d8cf' },
        rust: '#a3552e',
        muted: '#76615b',
        faint: '#a28b83',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.045em',
        display: '-0.035em',
        eyebrow: '0.14em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(42,21,17,0.04), 0 12px 32px -12px rgba(42,21,17,0.18)',
        lift: '0 24px 60px -24px rgba(42,21,17,0.35)',
      },
      maxWidth: {
        page: '80rem',
      },
    },
  },
  plugins: [],
};
