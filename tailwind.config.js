/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#060911',
          900: '#0b101d',
          850: '#101728',
          800: '#161e33',
          700: '#222d4a',
          600: '#324168',
        },
        ivory: {
          50: '#fdfbf7',
          100: '#f8f4ec',
          200: '#f0e8dc',
          300: '#e4d6c3',
          400: '#d1bfa6',
        },
        champagne: {
          200: '#f8f0e1',
          300: '#f1e2c6',
          400: '#e6cfa3',
          500: '#d6b87e',
          600: '#bf9d5e',
          700: '#9f7f45',
        },
        roseaccent: {
          300: '#f0adb9',
          400: '#e28394',
          500: '#cf5f73',
          600: '#b64359',
          700: '#953043',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
      },
      animation: {
        'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
        'float-slow': 'floating 4s ease-in-out infinite',
      },
      keyframes: {
        subtlePulse: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        floating: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
