# 🧭 PROJECT_NAVIGATION Skill

Skill per orientarsi rapidamente nella struttura del progetto **Al Ritrovo Booking System**.

## Quando Usare Questa Skill

Usa questa skill quando devi:
- Trovare file specifici nel progetto
- Capire la struttura organizzativa
- Identificare dove creare nuovi file
- Navigare tra feature e componenti
- Trovare documentazione relativa

## 📁 Struttura Progetto Finale

### Root Directory
```
Calendarbackup/
├── 📄 README.md                    ⭐ Overview progetto
├── 📄 package.json                 Configurazione progetto
├── 📄 playwright.config.ts         Configurazione test
├── 📄 vite.config.ts               Vite build config
├── 📄 tsconfig.json                TypeScript config
├── 📄 tailwind.config.js           Tailwind CSS config
└── 📄 .gitignore                   File ignorati (test-results, etc.)
```

### 📁 Codice Sorgente (`src/`)
```
src/
├── features/                       Feature modules (feature-based)
│   ├── booking/                    Sistema prenotazioni
│   │   ├── components/            Componenti booking
│   │   ├── hooks/                 Custom hooks
│   │   ├── constants/             Costanti
│   │   └── utils/                 Utilities
│   └── calendar/                  Feature calendario (legacy)
│
├── components/                     Componenti condivisi
│   ├── AdminHeader.tsx
│   ├── ProtectedRoute.tsx
│   ├── CookieConsent.tsx
│   └── ui/                        UI components base
│
├── pages/                          Route pages
│   ├── BookingRequestPage.tsx
│   ├── AdminLoginPage.tsx
│   ├── AdminDashboard.tsx
│   └── PrivacyPolicyPage.tsx
│
├── lib/                            Utilities e configurazioni
│   ├── supabase.ts                Client Supabase (authenticated)
│   ├── supabasePublic.ts          Client Supabase (public)
│   ├── email.ts                   Resend email client
│   ├── emailTemplates.ts          Template email
│   └── utils.ts                   Utility functions
│
├── types/                          TypeScript types
│   ├── booking.ts
│   ├── database.ts
│   ├── calendar.ts
│   ├── menu.ts
│   └── calendar-filters.ts
│
├── App.tsx                         App root
├── main.tsx                        Entry point
├── router.tsx                      React Router
└── index.css                       Global styles
```

### 📁 Test (`e2e/`)
```
e2e/
├── booking-flow/                   # 1 test - Flusso prenotazione
├── admin-crud/                     # 6 test - Operazioni CRUD admin
├── calendar/                       # 3 test - Funzionalità calendario
├── menu/                           # 8 test - Selezione menu
├── validation/                     # 1 test - Validazione form
├── ui-visual/                      # 18 test - Test visual e layout
├── archive/                        # 2 test - Test archivio
├── time-slots/                     # 4 test - Test time slots
├── mobile/                         # 5 test - Test responsive mobile
├── helpers/                        # Helper functions
│   └── auth.ts
├── screenshots/                    # Screenshot test
└── README.md                       # Documentazione test
```

### 📁 Documentazione (`docs/`)
```
docs/
├── agent-knowledge/                ⭐ Documentazione principale
│   ├── PROJECT_STATUS.md          Stato attuale progetto
│   ├── ARCHITECTURE.md            Architettura sistema
│   ├── PRD.md                     Product Requirements
│   ├── DATABASE_SETUP.md          Setup database
│   ├── SKILLS.md                  Skills disponibili
│   └── ...
│
├── reports/                        Report temporanei
│   ├── FINAL_VERIFICATION_COMPLETE_REPORT.md
│   ├── TEST_ORGANIZATION_COMPLETED.md
│   ├── PROJECT_CLEANUP_COMPLETED.md
│   └── ...
│
└── development/                    Guide di sviluppo
    └── PROJECT_ORGANIZATION.md    Guida struttura
```

### 📁 Altri File Importanti

```
supabase/                           Configurazione Supabase
├── migrations/                     Database migrations
├── functions/                      Edge functions
└── SETUP_DATABASE.md              Guida setup

scripts/                            Scripts organizzati
├── setup/                         Scripts di setup
├── utility/                       Scripts utility
└── maintenance/                   Scripts manutenzione

Knowledge/                          Knowledge base storica
├── ARCHIVE/                       File archiviati
├── Report agenti/                 Report completamento
├── PRD.md                         Product Requirements
└── PLANNING_TASKS.md              Planning e tasks

superpowers-main/                   Skills library (NON modificare)
└── skills/                        Skills Superpowers
```

## 🎯 Quick Navigation Guide

### Trova Componenti
- **Booking**: `src/features/booking/components/`
- **Condivisi**: `src/components/ui/`
- **Pages**: `src/pages/`

### Trova Hooks
- **Booking**: `src/features/booking/hooks/`
- **Globali**: `src/hooks/`

### Trova Configurazione
- **Supabase**: `src/lib/supabase.ts`
- **Test**: `playwright.config.ts`
- **Database**: `supabase/migrations/`

### Trova Documentazione
- **Stato Progetto**: `docs/agent-knowledge/PROJECT_STATUS.md`
- **Architettura**: `docs/agent-knowledge/ARCHITECTURE.md`
- **Test**: `e2e/README.md`
- **Indice**: `docs/README.md`

### Trova Test
- **Booking Flow**: `e2e/booking-flow/`
- **Admin CRUD**: `e2e/admin-crud/`
- **Menu**: `e2e/menu/`
- **Visual**: `e2e/ui-visual/`

## 📝 Pattern di Organizzazione

### Feature-Based
Ogni feature in `src/features/{feature}/`:
- `components/` - Componenti feature
- `hooks/` - Hooks feature
- `utils/` - Utilities feature
- `constants/` - Costanti feature

### Test Organized by Category
Ogni categoria di test in `e2e/{category}/`:
- `booking-flow/` - Test flusso utente
- `admin-crud/` - Test CRUD admin
- `menu/` - Test menu
- `ui-visual/` - Test visual

### Documentation Centralized
- **Attuale**: `docs/agent-knowledge/`
- **Storica**: `Knowledge/`
- **Report**: `docs/reports/`

## 🔍 Cerca File per Funzione

### Form Prenotazione Pubblico
- `src/pages/BookingRequestPage.tsx`
- `src/features/booking/components/BookingRequestForm.tsx`

### Dashboard Admin
- `src/pages/AdminDashboard.tsx`
- `src/features/booking/components/PendingRequestsTab.tsx`
- `src/features/booking/components/ArchiveTab.tsx`

### Test
- `e2e/booking-flow/01-booking-flow.spec.ts` - Test flusso prenotazione
- `e2e/admin-crud/` - Test CRUD admin
- `e2e/menu/` - Test menu

### Configurazione
- `package.json` - Dipendenze
- `playwright.config.ts` - Config test
- `tsconfig.json` - Config TypeScript

## 💡 Tips per Navigazione

1. **Codice**: Usa `src/features/{feature}/`
2. **Test**: Usa `e2e/{category}/`
3. **Doc**: Usa `docs/agent-knowledge/`
4. **Migrations**: Usa `supabase/migrations/`
5. **Scripts**: Usa `scripts/{category}/`

## 🚨 File Importanti da Conoscere

### Configurazione
- `README.md` - Overview progetto
- `package.json` - Dipendenze e scripts
- `playwright.config.ts` - Config test

### Entry Points
- `src/main.tsx` - Entry point app
- `src/router.tsx` - Route config
- `src/App.tsx` - Root component

### Database
- `supabase/migrations/001_initial_schema.sql` - Schema base
- `src/types/database.ts` - TypeScript types

### Documentazione
- `docs/agent-knowledge/PROJECT_STATUS.md` - Stato attuale ⭐
- `docs/agent-knowledge/ARCHITECTURE.md` - Architettura
- `e2e/README.md` - Guida test

## 🔄 Aggiornamenti

Questa skill viene aggiornata quando:
- Struttura cartelle cambia
- Nuove feature vengono aggiunte
- Pattern organizzazione cambiano

**Ultimo aggiornamento**: Gennaio 2025
