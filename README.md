# 🍽️ Al Ritrovo Booking System

Sistema di gestione prenotazioni per il ristorante **Al Ritrovo** di Bologna.

## 📋 Overview

Applicazione React standalone per gestire prenotazioni online, con:
- **Sezione Pubblica** (`/prenota`): Form per i clienti
- **Sezione Admin** (`/admin`): Dashboard gestionale con calendario

**Stack Tecnologico:**
- Frontend: React 18 + Vite + TypeScript + TailwindCSS
- Backend: Supabase (PostgreSQL + Auth + Edge Functions)
- Email: Resend API
- Hosting: Vercel
- Testing: Playwright E2E

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- npm o yarn
- Account Supabase
- Account Resend (per email)

### Setup Locale

```bash
# 1. Installa dipendenze
npm install

# 2. Configura variabili d'ambiente
# Copia .env.example a .env.local e compila le credenziali
npm run scripts/setup/setup-env.js  # O configura manualmente

# 3. Avvia dev server
npm run dev

# 4. Apri browser
# Form pubblico: http://localhost:5174/prenota
# Admin login: http://localhost:5174/login
```

### Variabili d'Ambiente

Crea `.env.local` nella root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your-key
SENDER_EMAIL=noreply@resend.dev
SENDER_NAME=Al Ritrovo
```

## 📁 Struttura Progetto

```
src/
├── features/          # Feature modules (booking, calendar)
├── components/        # Componenti condivisi
├── pages/            # Route pages
├── lib/              # Utilities (supabase, email)
└── types/            # TypeScript types

supabase/
├── migrations/       # Database migrations
└── functions/       # Edge Functions

docs/
├── agent-knowledge/  # Documentazione per agenti AI
├── reports/          # Report e verifiche
└── development/      # Guide di sviluppo

scripts/
├── setup/           # Scripts di setup
├── utility/         # Scripts utility
└── maintenance/      # Scripts di manutenzione
```

## 🧪 Testing

```bash
# Test E2E con Playwright
npm run test:e2e

# Test E2E con UI
npm run test:e2e:ui

# Test in debug mode
npm run test:e2e:debug

# Mostra report
npm run test:report
```

## 📚 Documentazione

- **Architettura**: [`docs/agent-knowledge/ARCHITECTURE.md`](docs/agent-knowledge/ARCHITECTURE.md)
- **Stato Progetto**: [`docs/agent-knowledge/PROJECT_STATUS.md`](docs/agent-knowledge/PROJECT_STATUS.md)
- **Setup Database**: [`docs/agent-knowledge/DATABASE_SETUP.md`](docs/agent-knowledge/DATABASE_SETUP.md)
- **Skills**: [`docs/agent-knowledge/SKILLS.md`](docs/agent-knowledge/SKILLS.md)
- **Indice Completo**: [`docs/README.md`](docs/README.md)

## 🗄️ Database

### Schema Principale

- `booking_requests`: Prenotazioni clienti
- `admin_users`: Utenti admin
- `email_logs`: Log invio email
- `restaurant_settings`: Impostazioni ristorante
- `menu_items`: Voci menù

### Migrazioni

Le migrazioni si trovano in `supabase/migrations/`. Per applicarle:

```bash
# Via Supabase CLI
supabase db push

# O manualmente via Supabase Dashboard
```

## 🔒 Security

- **RLS Policies**: Row Level Security configurato su tutte le tabelle
- **Rate Limiting**: 3 richieste/ora per form pubblico
- **GDPR**: Cookie consent banner implementato
- **Auth**: Supabase Auth per area admin

## 📧 Email System

Sistema email automatico con Resend:
- Conferma prenotazione accettata
- Notifica rifiuto prenotazione
- Conferma cancellazione

Edge Function Supabase: `supabase/functions/send-email/`

## 🚢 Deploy

### Vercel

Vercel è collegato al branch **main**: ogni push su `main` triggera il deploy in produzione.

```bash
# Deploy in produzione (solo quando le modifiche sono pronte!)
git push origin main

# O deploy manuale
vercel --prod
```

**Per non rompere la build**: fai le modifiche su un branch diverso (es. `layout-improvements` o `develop`) e fai push solo su quel branch; merge su `main` solo quando sei pronto per andare in produzione. Vedi [Workflow branch](docs/development/BRANCH-WORKFLOW.md).

### Configurazione Vercel

Le variabili d'ambiente vanno configurate nel dashboard Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `SENDER_EMAIL`
- `SENDER_NAME`

## 🛠️ Scripts Utili

```bash
# Setup ambiente iniziale
node scripts/setup/setup-env.js

# Genera PDF base64 per menu
node scripts/utility/generate-pdf-env.js

# Query menu items
node scripts/utility/query_menu.js
```

## 📊 Stato Progetto

**Completamento:** ~85%

✅ Setup iniziale
✅ Database schema
✅ Autenticazione admin
✅ Form prenotazione pubblico
✅ Dashboard admin
✅ Sistema email
✅ Calendario integrato
✅ Security & GDPR

## 🤝 Contribuire / Sviluppo

1. **Lavora su un branch diverso da `main`** (es. `layout-improvements`, `develop`, o `feature/nome`) così Vercel non rifà deploy in produzione.
2. Implementa le modifiche e testa con `npm run test:e2e`.
3. Quando sei pronto: merge su `main` e push (o apri PR). Vedi [Workflow branch](docs/development/BRANCH-WORKFLOW.md).

## 📞 Supporto

- **Repository**: https://github.com/Matteo-Exp-Transformer/Calendario-Alritrovo-Prenotazioni
- **Supabase Project**: dphuttzgdcerexunebct
- **Documentazione**: Vedi `docs/README.md`

## 📝 License

Proprietario: Al Ritrovo - Bologna

---

**Ultimo aggiornamento**: Gennaio 2025













