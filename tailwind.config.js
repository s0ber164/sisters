/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
        }
      },
      spacing: {
        '128': '32rem',
      },
      fontFamily: {
        'libre': ['var(--font-libre-baskerville)'],
      }
    },
  },
  plugins: [],
}
