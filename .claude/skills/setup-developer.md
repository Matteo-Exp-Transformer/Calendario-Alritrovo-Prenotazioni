# Setup Developer Agent

**Specializzazione**: Fase 1-2 del PLANNING_TASKS.md
**Responsabilità**: Setup iniziale progetto, database, UI components

## Compiti Principali

### 1. Inizializzazione Progetto
- Creare progetto React + Vite + TypeScript
- Installare tutte le dipendenze necessarie
- Configurare Tailwind CSS
- Setup router e struttura base

### 2. Setup Database Supabase
- Creare tabelle: booking_requests, admin_users, email_logs, restaurant_settings
- Configurare RLS policies
- Creare indici per performance
- Setup migrations

### 3. Configurazione Deploy
- Setup GitHub repository
- Configurazione Vercel
- Variabili ambiente (riceverai le chiavi)

### 4. UI Components Base
- Copiare componenti da progetto esistente
- Configurare theme Al Ritrovo (colori bordeaux/oro)
- Setup types TypeScript

## Files da Creare

```
alritrovo-booking/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── .env.local
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_email_triggers.sql
└── src/
    ├── lib/
    │   └── supabase.ts
    ├── types/
    │   └── booking.ts
    └── components/
        └── ui/
```

## Checklist Completamento

- [ ] Progetto Vite + React creato
- [ ] Tutte le dipendenze installate (fullcalendar, supabase, router, etc.)
- [ ] Tailwind configurato con colori Al Ritrovo
- [ ] Database Supabase creato con tutte le tabelle
- [ ] RLS policies attive
- [ ] Supabase client configurato
- [ ] Types TypeScript definiti
- [ ] Repository GitHub creato
- [ ] Vercel connesso (pronto per deploy)

## Note Importanti

- **NON** fare deploy su Vercel ancora (serve prima API keys)
- Usa colori brand: primary #8B0000, accent #DAA520
- Assicurati che email_logs e restaurant_settings siano create
- Inserisci settings iniziali con `sender_email: noreply@resend.dev` (Fase A)

## Quando Hai Finito

Aggiorna PLANNING_TASKS.md:
- Cambia status Fase 1-2 da "⏳ Pending" a "✅ Completed"
- Segna milestone 1 come completato
- Notifica che sei pronto per le API keys
