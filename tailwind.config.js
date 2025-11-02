/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette "Caldo & Legno" - Ristorante Tradizionale
        'warm-wood': 'rgb(139 69 19 / var(--tw-alpha-value, 1))',        // Marrone legno scuro
        'warm-wood-dark': 'rgb(107 52 16 / var(--tw-alpha-value, 1))',   // Marrone legno ancora più scuro
        'warm-beige': 'rgb(245 222 179 / var(--tw-alpha-value, 1))',       // Beige chiaro
        'warm-orange': 'rgb(210 105 30 / var(--tw-alpha-value, 1))',      // Arancio cioccolato
        'warm-cream': 'rgb(255 248 220 / var(--tw-alpha-value, 1))',       // Crema
        'olive-green': 'rgb(107 142 35 / var(--tw-alpha-value, 1))',      // Verde oliva
        'terracotta': 'rgb(224 112 65 / var(--tw-alpha-value, 1))',       // Terracotta
        'gold-warm': 'rgb(218 165 32 / var(--tw-alpha-value, 1))',        // Oro caldo

        // Retrocompatibilità (mantiene riferimenti vecchi)
        'al-ritrovo': {
          primary: '#8B4513',          // warm-wood
          'primary-dark': '#6B3410',   // warm-wood-dark
          'primary-light': '#D2691E',  // warm-orange
          accent: '#DAA520',           // gold-warm
        },

        // Colori eventi (ispirato al calendario)
        booking: {
          cena: '#8B4513',             // warm-wood
          aperitivo: '#DAA520',        // gold-warm
          evento: '#E07041',           // terracotta
          laurea: '#6B8E23',           // olive-green
        },

        // Status prenotazioni
        status: {
          pending: '#D2691E',          // warm-orange
          accepted: '#6B8E23',         // olive-green
          rejected: '#8B4513',         // warm-wood
        }
      },
      fontFamily: {
        // Font moderni e professionali
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        display: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
