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
        'warm-wood': '#8B4513',        // Marrone legno scuro
        'warm-wood-dark': '#6B3410',   // Marrone legno ancora più scuro
        'warm-beige': '#F5DEB3',       // Beige chiaro
        'warm-orange': '#D2691E',      // Arancio cioccolato
        'warm-cream': '#FFF8DC',       // Crema
        'olive-green': '#6B8E23',      // Verde oliva
        'terracotta': '#E07041',       // Terracotta
        'gold-warm': '#DAA520',        // Oro caldo

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
