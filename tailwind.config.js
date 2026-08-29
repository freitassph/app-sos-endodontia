/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Libre Baskerville"', 'serif'],
      },
      colors: {
        clinical: {
          midnight: '#071426',
          ink: '#10233F',
          ivory: '#F7F5EF',
          mist: '#EEF3F5',
        },
        mineral: {
          50: '#E8FBF5',
          100: '#C9F5E7',
          200: '#96E8D0',
          300: '#55D4AF',
          400: '#14C99A',
          500: '#08A97A',
          600: '#078963',
          700: '#096E53',
          800: '#0B5744',
        },
        primary: {
          DEFAULT: '#0F172A',
          50: '#f8fafc',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          DEFAULT: '#0EA5E9',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        danger: {
          DEFAULT: '#F43F5E',
          500: '#f43f5e',
        }
      },
      screens: {
        'xs': '375px',
        'desktop': '1100px',
      },
      boxShadow: {
        surface: '0 1px 2px rgba(7,20,38,.04)',
        elevated: '0 18px 40px -24px rgba(7,20,38,.32)',
      }
    },
  },
  plugins: [],
}
