/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm Spanish accent + calm sand/ink neutrals.
        sand: {
          50: '#faf7f2',
          100: '#f4eee4',
          200: '#e9ded0',
        },
        ink: {
          DEFAULT: '#1f1b17',
          soft: '#4b443c',
          muted: '#857a6d',
        },
        terracotta: {
          50: '#fbf0ea',
          100: '#f3d8c9',
          400: '#d2774e',
          500: '#c4633a',
          600: '#a64f2c',
          700: '#863f23',
        },
        sea: {
          400: '#3f8fa3',
          500: '#2f7689',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,27,23,0.04), 0 6px 24px -12px rgba(31,27,23,0.18)',
      },
    },
  },
  plugins: [],
}
