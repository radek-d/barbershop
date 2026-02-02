/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Bebas Neue"', 'cursive'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
          950: '#000000',
        },
        barber: {
          red: '#DC2626',
          'red-dark': '#991B1B',
        }
      },
      borderRadius: {
        'xl': '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'brutal-sm': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
      }
    },
  },
  plugins: [],
}
