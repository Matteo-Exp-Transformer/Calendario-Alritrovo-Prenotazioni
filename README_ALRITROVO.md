# 🍽️ Al Ritrovo - Sistema Prenotazioni Online

Sistema di gestione prenotazioni per ristorante con calendario integrato, sviluppato con React + Vite + Supabase.

---

## 📊 Status Progetto

**Versione**: 1.0.0 (Fase 1-2 Completata)
**Ultimo Aggiornamento**: 27 Ottobre 2025

| Fase | Nome | Status | Tempo |
|------|------|--------|-------|
| 1-2  | Setup Iniziale + UI Base | ✅ COMPLETATO | 4h |
| 3    | Autenticazione Admin | ⏳ Pending | 2h |
| 4    | Form Richiesta Pubblica | ⏳ Pending | 3h |
| 5    | Admin Dashboard | ⏳ Pending | 3h |
| 6    | Calendario Integrazione | ⏳ Pending | 2h |
| 7    | Sistema Email | ⏳ Pending | 3h |
| 8    | Security & GDPR | ⏳ Pending | 1.5h |
| 9    | Testing & Polish | ⏳ Pending | 2h |
| 10   | Deploy & Integrazione | ⏳ Pending | 1h |

**Totale**: 21.5 ore stimate

---

## 🚀 Quick Start

### Prerequisiti

- Node.js >= 18.x
- npm >= 9.x
- Account Supabase (database già configurato)
- Account Resend (per email, Fase 7)

### Installazione

```bash
# Clone repository
cd c:\Users\matte.MIO\Documents\GitHub\Calendarbackup

# Installa dipendenze
npm install

# Configura environment variables (già presente)
# Verifica .env.local

# Avvia dev server
npm run dev
```

**URL Dev**: http://localhost:5173

### Build Produzione

```bash
npm run build
npm run preview
```

---

## 🗄️ Setup Database

**IMPORTANTE**: Prima di usare l'applicazione, esegui il setup database:

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona progetto: `dphuttzgdcerexunebct`
3. SQL Editor → New Query
4. Copia e incolla `supabase/migrations/001_initial_schema.sql`
5. Run

**Istruzioni dettagliate**: `supabase/SETUP_DATABASE.md`

---

## 🏗️ Struttura Progetto

```
c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\
├── src/
│   ├── lib/              # Utilities (Supabase client, helpers)
│   ├── types/            # TypeScript types & interfaces
│   ├── features/         # Feature modules (booking, calendar)
│   ├── components/       # UI components (Button, Input, etc.)
│   ├── pages/            # Route pages
│   ├── App.tsx           # Main app with providers
│   ├── router.tsx        # React Router config
│   └── main.tsx          # Entry point
├── supabase/
│   └── migrations/       # Database migrations
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── .env.local            # Environment variables
```

---

## 🎨 Tech Stack

**Frontend**:
- React 18.2
- TypeScript 5.2
- Vite 5.0
- React Router 7
- TailwindCSS 3.x (+ @tailwindcss/postcss)
- Radix UI (Select, etc.)
- Lucide Icons

**Backend & Database**:
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS)

**State Management**:
- TanStack Query (React Query 5)

**Calendar**:
- FullCalendar 6.x (daygrid, timegrid, interaction, list, multimonth)

**Email**:
- Resend API
- React Email Components

**Utilities**:
- date-fns 4.x
- clsx + tailwind-merge
- react-toastify

---

## 🎨 Colori Brand Al Ritrovo

```css
/* Primario */
--al-ritrovo-primary: #8B0000;        /* Bordeaux */
--al-ritrovo-primary-dark: #6B0000;   /* Bordeaux scuro */
--al-ritrovo-primary-light: #A52A2A;  /* Bordeaux chiaro */
--al-ritrovo-accent: #DAA520;         /* Oro */

/* Tipi Prenotazione */
--booking-cena: #8B0000;      /* Bordeaux */
--booking-aperitivo: #DAA520;  /* Oro */
--booking-evento: #9370DB;     /* Viola */
--booking-laurea: #20B2AA;     /* Turchese */

/* Status */
--status-pending: #FFD700;    /* Giallo */
--status-accepted: #32CD32;   /* Verde */
--status-rejected: #DC143C;   /* Rosso */
```

Usage in Tailwind:
```jsx
<div className="bg-al-ritrovo-primary text-white">
  <h1>Al Ritrovo</h1>
</div>

<span className="text-status-accepted">Confermato</span>
```

---

## 🔐 Environment Variables

File: `.env.local`

```bash
# Supabase
VITE_SUPABASE_URL=https://dphuttzgdcerexunebct.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Resend Email (Fase A - temporaneo)
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@resend.dev
SENDER_NAME=Al Ritrovo

# App Config
VITE_APP_ENV=development
VITE_RESTAURANT_NAME=Al Ritrovo
VITE_RESTAURANT_ADDRESS=Bologna, Italia
```

---

## 📍 Routes

| Path | Component | Descrizione | Status |
|------|-----------|-------------|--------|
| `/` | Redirect | → /prenota | ✅ |
| `/prenota` | BookingRequestPage | Form pubblico prenotazioni | ⏳ Fase 4 |
| `/login` | AdminLoginPage | Login area admin | ⏳ Fase 3 |
| `/admin` | AdminDashboard | Dashboard gestione | ⏳ Fase 5 |
| `*` | Redirect | 404 → /prenota | ✅ |

---

## 🗃️ Database Schema

### Tabelle (4)

**1. booking_requests** (17 colonne)
- Informazioni cliente (nome, email, telefono)
- Dettagli prenotazione (tipo, data, ora, ospiti)
- Status management (pending/accepted/rejected)
- Cancellation tracking

**2. admin_users** (7 colonne)
- Autenticazione admin
- Ruoli (admin/staff)

**3. email_logs** (8 colonne)
- Tracking invio email
- Provider response (Resend)
- Error handling

**4. restaurant_settings** (4 colonne)
- Configurazione dinamica
- Settings JSON storage

### RLS Policies (9)

- Public insert per booking_requests
- Admin-only per tutte le altre operazioni

---

## 📦 UI Components Disponibili

```jsx
import { Button, Input, Select, Textarea, Label } from '@/components/ui'

// Button variants
<Button variant="primary">Prenota</Button>
<Button variant="secondary">Annulla</Button>
<Button variant="danger">Elimina</Button>
<Button variant="success">Conferma</Button>
<Button variant="ghost">Chiudi</Button>
<Button variant="outline">Vedi Dettagli</Button>

// Input with label & error
<Input
  label="Nome Completo"
  error="Campo obbligatorio"
  required
/>

// Select
<Select
  label="Tipo Evento"
  options={[
    { value: 'cena', label: 'Cena' },
    { value: 'aperitivo', label: 'Aperitivo' }
  ]}
  required
/>

// Textarea
<Textarea
  label="Note"
  placeholder="Eventuali richieste speciali..."
/>
```

---

## 🛠️ Development

### Scripts

```bash
# Dev server (hot reload)
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

### Path Aliases

TypeScript e Vite configurati con alias `@/`:

```typescript
import { supabase } from '@/lib/supabase'
import { BookingRequest } from '@/types/booking'
import { Button } from '@/components/ui'
```

### Code Style

- TypeScript strict mode attivo
- ESLint configurato
- Prettier (da aggiungere se necessario)

---

## 📧 Sistema Email (Fase 7)

### Fase A: Setup Iniziale (GRATIS)
**Mittente**: `noreply@resend.dev` (dominio Resend)
**Ideale per**: Sviluppo, test, prime settimane produzione

### Fase B: Dominio Custom (12€/anno)
**Mittente**: `prenotazioni@alritrovo.com` (dominio custom)
**Ideale per**: Produzione finale, clienti reali

**Migrazione A→B**: 20 minuti (solo configurazione DNS)

---

## 🔒 Security & GDPR

- ✅ RLS policies attive su tutte le tabelle
- ✅ Rate limiting (3 richieste/ora) - Fase 8
- ✅ Privacy Policy page - Fase 8
- ✅ Consenso checkbox nel form - Fase 8
- ✅ Email tracking per trasparenza
- ✅ Conservazione dati: 2 anni (da implementare auto-cleanup)

---

## 🧪 Testing

### Build Status

```bash
npm run build
```

✅ **PASSING** (1.72s, 0 errors)

### TypeScript Check

✅ **ZERO ERRORS**

### Dev Server

✅ **RUNNING** (159ms startup)

---

## 📚 Documentazione

**File di riferimento**:
- `PRD.md` - Product Requirements Document completo
- `PLANNING_TASKS.md` - Task breakdown dettagliato (21.5h)
- `SETUP_REPORT.md` - Report tecnico setup Fase 1-2
- `PHASE_1-2_COMPLETED.md` - Report completamento Fase 1-2
- `supabase/SETUP_DATABASE.md` - Istruzioni database setup

---

## 🐛 Troubleshooting

### Build fails con errore Tailwind PostCSS

**Soluzione**: Assicurati di usare `@tailwindcss/postcss` in `postcss.config.js`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### TypeScript errors su import '@/*'

**Soluzione**: Verifica `tsconfig.json` abbia path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Supabase connection error

**Soluzione**:
1. Verifica `.env.local` abbia le chiavi corrette
2. Controlla che database schema sia stato eseguito

---

## 🚢 Deploy (Fase 10)

**Platform**: Vercel

**Steps**:
1. Push su GitHub
2. Connetti GitHub a Vercel
3. Importa progetto
4. Setup variabili ambiente (da `.env.local`)
5. Deploy automatico

**URL finale**: `https://alritrovo-booking.vercel.app`

---

## 👥 Contributors

**Setup Developer Agent** (Claude) - Fase 1-2
- Inizializzazione progetto
- Setup database
- UI components base
- Router e struttura

**Auth Developer Agent** - Fase 3 (prossimo)
**Feature Developer Agent** - Fasi 4-6 (prossimo)
**Email Developer Agent** - Fase 7 (prossimo)
**QA Developer Agent** - Fasi 8-9 (prossimo)
**Deploy Developer Agent** - Fase 10 (prossimo)

---

## 📝 License

Private - Al Ritrovo Restaurant

---

## 📞 Contatti

**Ristorante**: Al Ritrovo
**Location**: Bologna, Italia
**Website**: (da aggiungere)
**Email**: (da aggiungere)

---

**Versione**: 1.0.0
**Ultimo Aggiornamento**: 27 Ottobre 2025
**Status**: ✅ Fase 1-2 Completata
