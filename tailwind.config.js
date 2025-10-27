/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'al-ritrovo': {
          primary: '#8B0000',
          'primary-dark': '#6B0000',
          'primary-light': '#A52A2A',
          accent: '#DAA520',
        },
        booking: {
          cena: '#8B0000',
          aperitivo: '#DAA520',
          evento: '#9370DB',
          laurea: '#20B2AA',
        },
        status: {
          pending: '#FFD700',
          accepted: '#32CD32',
          rejected: '#DC143C',
        }
      }
    },
  },
  plugins: [],
}
