/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        body: ['"Parkinsans"', 'sans-serif'],
      },
      colors: {
        background: '#FAF5ED',
        foreground: '#3B2316',
        muted: '#8B7355',
        cream: '#FAF5ED',
        'cream-dark': '#EDE5DA',
        brown: {
          DEFAULT: '#3B2316',
          light: '#5C3D2E',
          dark: '#2C1810',
          muted: '#8B7355',
          accent: '#D4A373',
        },
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.8s ease-out both',
        'fade-rise-delay': 'fade-rise 0.8s ease-out 0.2s both',
        'fade-rise-delay-2': 'fade-rise 0.8s ease-out 0.4s both',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
