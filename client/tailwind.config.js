/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f6f2',
          100: '#e0ece5',
          200: '#c3dacd',
          300: '#9cbfae',
          400: '#6f9d8a',
          500: '#4e826e',
          600: '#3a6a57',
          700: '#285943', // Primary deep forest green
          800: '#214736',
          900: '#1c3b2d',
          950: '#0e2018',
        },
        cream: {
          50: '#fdfdfb',
          100: '#faf9f5',
          200: '#F7F5EF', // Secondary warm cream
          300: '#ece7db',
          400: '#ddd4c0',
          500: '#c9bda4',
        },
        amberGold: {
          50: '#fbf7f2',
          100: '#f6ece1',
          200: '#edd8c3',
          300: '#e1bea0',
          400: '#d99155', // Accent muted orange / warm amber
          500: '#cb7a3d',
          600: '#b7612f',
        },
        charcoal: {
          50: '#f6f7f6',
          100: '#e2e4e2',
          200: '#c5c8c5',
          300: '#9fa39f',
          400: '#757a75',
          500: '#585c58',
          600: '#434743',
          700: '#343834',
          800: '#292D2A', // Dark charcoal text
          900: '#1d201e',
          950: '#101211',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
