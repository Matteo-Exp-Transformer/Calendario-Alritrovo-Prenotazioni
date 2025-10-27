# Testing & Deploy Developer Agent

**Specializzazione**: Fase 9-10 del PLANNING_TASKS.md
**Responsabilità**: Testing completo, fix bugs, deploy finale

## Compiti Principali

### 1. Testing Completo (2h)
- Testing form pubblico
- Testing autenticazione admin
- Testing dashboard admin
- Testing calendario
- Testing sistema email
- Testing rate limiting & privacy

### 2. Deploy Finale (1h)
- Deploy Supabase Edge Functions
- Deploy Vercel produzione
- Integrazione link Wix
- Documentazione README

## Testing Checklist Dettagliato

### 🟢 Fase 9.1: Testing Form Pubblico (20 min)

**Test Cases**:

#### TC1: Submit con Dati Validi
- [ ] Compila tutti i campi obbligatori
- [ ] Check privacy checkbox
- [ ] Submit form
- [ ] Verifica toast successo
- [ ] Verifica redirect/messaggio conferma
- [ ] Verifica record in DB (`status='pending'`)
- [ ] Verifica email "richiesta ricevuta" arriva (entro 30 sec)

#### TC2: Validazione Campi Obbligatori
- [ ] Submit senza nome → Errore "Campo obbligatorio"
- [ ] Submit senza email → Errore "Campo obbligatorio"
- [ ] Submit senza data → Errore "Campo obbligatorio"
- [ ] Submit senza privacy checkbox → Bottone disabilitato

#### TC3: Validazione Email
- [ ] Email "invalid" → Errore "Email non valida"
- [ ] Email "test@" → Errore "Email non valida"
- [ ] Email "test@example.com" → Success

#### TC4: Validazione Data
- [ ] Data nel passato (ieri) → Errore "Data non valida"
- [ ] Data oggi → Success
- [ ] Data futura → Success

#### TC5: Rate Limiting
- [ ] Submit 1° richiesta → Success
- [ ] Submit 2° richiesta → Success
- [ ] Submit 3° richiesta → Success
- [ ] Submit 4° richiesta → Errore 429 "Troppe richieste"
- [ ] Verifica messaggio: "Riprova tra X minuti"

#### TC6: Privacy Policy
- [ ] Link "Privacy Policy" apre /privacy in nuova tab
- [ ] Pagina privacy completa e leggibile
- [ ] Click "Torna al form" → Redirect corretto

#### TC7: Responsive
- [ ] Mobile (375px): Form leggibile, campi uno sotto l'altro
- [ ] Tablet (768px): Form centrato, leggibile
- [ ] Desktop (1920px): Form centrato, max-width corretto

**Bugs da Fixare**:
- [ ] Nessun bug trovato / Bug fixati

---

### 🔵 Fase 9.2: Testing Login Admin (15 min)

**Test Cases**:

#### TC1: Login con Credenziali Valide
- [ ] Email admin corretta + password corretta
- [ ] Click "Accedi"
- [ ] Verifica redirect a `/admin`
- [ ] Verifica user autenticato (nome in header)
- [ ] Verifica sessione persistente (refresh pagina)

#### TC2: Login con Credenziali Invalide
- [ ] Email corretta + password errata → Errore
- [ ] Email errata + password corretta → Errore
- [ ] Verifica messaggio errore user-friendly
- [ ] Verifica rimane in `/login`

#### TC3: Protected Route
- [ ] Accedi a `/admin` senza login
- [ ] Verifica redirect automatico a `/login`
- [ ] Dopo login → Redirect back a `/admin`

#### TC4: Logout
- [ ] Click bottone "Logout" in header
- [ ] Verifica redirect a `/login`
- [ ] Verifica sessione cancellata
- [ ] Tentativo accesso `/admin` → Redirect login

**Bugs da Fixare**:
- [ ] Nessun bug trovato / Bug fixati

---

### 🟡 Fase 9.3: Testing Dashboard Admin (30 min)

**Test Cases**:

#### TC1: Tab "Prenotazioni Pendenti"
- [ ] Vedi lista richieste con `status='pending'`
- [ ] Badge count corretto (es: "Pendenti (3)")
- [ ] Ordinamento cronologico (più recenti in alto)
- [ ] Card mostra tutti i dati: nome, email, telefono, data, ora, ospiti, note

#### TC2: Accept Request Flow
- [ ] Click "✅ ACCETTA" su richiesta pending
- [ ] Modal si apre con dati precompilati
- [ ] Modifica orario fine da default +2h a +3h
- [ ] Click "CONFERMA PRENOTAZIONE"
- [ ] Verifica modal si chiude
- [ ] Verifica richiesta scompare da "Pendenti"
- [ ] Verifica appare in "Calendario"
- [ ] Verifica appare in "Archivio" (filtro Accettate)
- [ ] Verifica status in DB = 'accepted'
- [ ] Verifica confirmed_start e confirmed_end popolati
- [ ] Verifica email "Conferma" arriva al cliente (entro 30 sec)
- [ ] Verifica email contiene orari corretti

#### TC3: Reject Request Flow
- [ ] Click "❌ RIFIUTA" su richiesta pending
- [ ] Modal si apre
- [ ] Inserisci motivo: "Sala occupata"
- [ ] Click "RIFIUTA PRENOTAZIONE"
- [ ] Verifica modal si chiude
- [ ] Verifica richiesta scompare da "Pendenti"
- [ ] Verifica appare in "Archivio" (filtro Rifiutate)
- [ ] Verifica status in DB = 'rejected'
- [ ] Verifica rejection_reason = "Sala occupata"
- [ ] Verifica email "Rifiuto" arriva al cliente (entro 30 sec)
- [ ] Verifica email contiene motivo

#### TC4: Tab "Archivio"
- [ ] Filtro "Tutte" → Mostra accepted + rejected
- [ ] Filtro "Accettate" → Solo status='accepted'
- [ ] Filtro "Rifiutate" → Solo status='rejected'
- [ ] Per accepted: Link "📅 Vedi in Calendario" funziona
- [ ] Per rejected: Motivo rifiuto mostrato

#### TC5: Responsive Dashboard
- [ ] Mobile: Tab uno sotto l'altro
- [ ] Tablet: Layout leggibile
- [ ] Desktop: 3 colonne

**Bugs da Fixare**:
- [ ] Nessun bug trovato / Bug fixati

---

### 📅 Fase 9.4: Testing Calendario (20 min)

**Test Cases**:

#### TC1: Visualizzazione Eventi
- [ ] Calendario mostra solo eventi `status='accepted'`
- [ ] Eventi hanno titolo corretto: "Mario Rossi - 4 ospiti"
- [ ] Orari start/end corretti
- [ ] Colori corretti per tipo:
  - Cena: #8B0000 (bordeaux)
  - Aperitivo: #DAA520 (oro)
  - Evento: #9370DB (viola)
  - Laurea: #20B2AA (acqua)

#### TC2: Cambio Vista
- [ ] Vista Mese → Eventi mostrati come box
- [ ] Vista Settimana → Eventi con orari
- [ ] Vista Giorno → Lista dettagliata
- [ ] Vista Anno (multimonth) → Overview generale

#### TC3: Click Evento
- [ ] Click su evento nel calendario
- [ ] Modal "Modifica Prenotazione" si apre
- [ ] Dati cliente readonly (nome, email, telefono)
- [ ] Data/ora modificabili
- [ ] Ospiti modificabile

#### TC4: Modifica Evento
- [ ] Modifica data da 15/02 a 16/02
- [ ] Modifica ora fine da 22:00 a 23:00
- [ ] Click "💾 SALVA MODIFICHE"
- [ ] Verifica modal si chiude
- [ ] Verifica evento nel calendario ha nuova data/ora
- [ ] Verifica update in DB

#### TC5: Cancella Evento
- [ ] Click su evento
- [ ] Click "🗑️ CANCELLA PRENOTAZIONE"
- [ ] Verifica dialog conferma: "Sei sicuro?"
- [ ] Click "Sì, cancella"
- [ ] Verifica evento scompare dal calendario
- [ ] Verifica status in DB = 'cancelled' (o deleted)

#### TC6: Validazione
- [ ] Ora fine < ora inizio → Errore
- [ ] Data nel passato → Errore
- [ ] Ospiti 0 o negativo → Errore
- [ ] Ospiti > 50 → Errore (se c'è limite)

**Bugs da Fixare**:
- [ ] Nessun bug trovato / Bug fixati

---

### 📧 Fase 9.5: Testing Email System (15 min)

**Test Cases**:

#### TC1: Email "Richiesta Ricevuta"
- [ ] Submit form prenotazione
- [ ] Email arriva entro 30 secondi
- [ ] Mittente: `Al Ritrovo <noreply@resend.dev>`
- [ ] Oggetto: "Richiesta Prenotazione Ricevuta - Al Ritrovo"
- [ ] Corpo email contiene:
  - Nome cliente
  - Data richiesta
  - Orario richiesto
  - Numero ospiti
  - Tipo evento
  - Note (se presenti)
  - Messaggio "in attesa di conferma"
- [ ] Design responsive (mobile)
- [ ] Colori Al Ritrovo (bordeaux/oro)

#### TC2: Email "Prenotazione Confermata"
- [ ] Admin accetta richiesta pending
- [ ] Email arriva entro 30 secondi
- [ ] Oggetto: "🎉 Prenotazione Confermata - Al Ritrovo"
- [ ] Corpo email contiene:
  - Nome cliente
  - Data CONFERMATA (non richiesta)
  - Orario CONFERMATO (inizio - fine)
  - Numero ospiti
  - Indirizzo ristorante
  - (Opzionale) Link Google Maps
- [ ] Badge/icona "CONFERMATA" visibile

#### TC3: Email "Prenotazione Rifiutata"
- [ ] Admin rifiuta richiesta con motivo
- [ ] Email arriva entro 30 secondi
- [ ] Oggetto: "Richiesta Prenotazione - Al Ritrovo"
- [ ] Corpo email contiene:
  - Nome cliente
  - Data richiesta
  - Orario richiesto
  - Motivo rifiuto: "Sala occupata"
  - Link "Richiedi Nuova Prenotazione"
- [ ] Tono scuse appropriato

#### TC4: Email Logging
- [ ] Ogni email loggata in `email_logs` table
- [ ] Campi popolati:
  - booking_id
  - email_type
  - recipient_email
  - sent_at
  - status='sent'
  - provider_response (ID email Resend)

#### TC5: Email Fallite
- [ ] Test con email invalida (opzionale)
- [ ] Verifica log status='failed'
- [ ] Verifica error_message popolato

#### TC6: Spam Check
- [ ] Verifica email NON in spam
- [ ] Se in spam: normale con resend.dev (Fase A)
- [ ] Nota: Con dominio custom (Fase B) migliorerà

**Bugs da Fixare**:
- [ ] Nessun bug trovato / Bug fixati

---

### 🛡️ Fase 9.6: UI Polish & Responsive (20 min)

**Cross-Browser Testing**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest) - se disponibile
- [ ] Edge (latest)

**Responsive Breakpoints**:
- [ ] Mobile S (320px): Tutto leggibile
- [ ] Mobile M (375px): Tutto leggibile
- [ ] Mobile L (425px): Tutto leggibile
- [ ] Tablet (768px): Layout adattato
- [ ] Desktop (1024px): Layout ottimale
- [ ] Desktop L (1920px): Centrato, max-width

**Loading States**:
- [ ] Form submit → Spinner + "Invio in corso..."
- [ ] Login → Spinner
- [ ] Dashboard fetch → Skeleton loader
- [ ] Calendario fetch → Spinner

**Empty States**:
- [ ] Nessuna richiesta pending → "Nessuna richiesta in attesa"
- [ ] Archivio vuoto → "Nessuna prenotazione trovata"
- [ ] Calendario senza eventi → Calendario pulito

**Error States**:
- [ ] Errore network → Toast "Errore di connessione"
- [ ] Errore server 500 → Toast "Errore del server"
- [ ] Errore rate limit → Toast specifico
- [ ] Form validation → Messaggi rossi sotto campi

**Animazioni**:
- [ ] Modal open/close: Fade + scale
- [ ] Toast: Slide in da destra
- [ ] Tab switch: Smooth transition
- [ ] Button hover: Color change smooth

**Bugs da Fixare**:
- [ ] Nessun bug trovato / Bug fixati

---

## 🚀 Fase 10: Deploy & Integrazione

### Task 10.1: Deploy Supabase Edge Functions (20 min)

```bash
# 1. Login Supabase CLI
supabase login

# 2. Link progetto
supabase link --project-ref YOUR_PROJECT_ID

# 3. Deploy send-booking-email
cd supabase/functions/send-booking-email
supabase functions deploy send-booking-email

# 4. Deploy submit-booking (rate limiting)
cd ../submit-booking
supabase functions deploy submit-booking

# 5. Set secrets
supabase secrets set RESEND_API_KEY=YOUR_KEY_HERE
supabase secrets set SENDER_EMAIL=noreply@resend.dev

# 6. Verifica secrets
supabase secrets list

# 7. Test functions
supabase functions invoke send-booking-email --data '{"type":"request_received","booking":{"id":"test","client_name":"Test","client_email":"YOUR_EMAIL","desired_date":"2025-03-01","num_guests":2,"event_type":"cena"}}'
```

**Checklist**:
- [ ] CLI Supabase installato
- [ ] Login completato
- [ ] Link a progetto corretto
- [ ] Function `send-booking-email` deployed
- [ ] Function `submit-booking` deployed
- [ ] Secrets RESEND_API_KEY e SENDER_EMAIL configurati
- [ ] Test email ricevuta

---

### Task 10.2: Deploy Vercel (15 min)

**Steps**:

1. **Push GitHub**:
```bash
git add .
git commit -m "feat: complete booking system with email and security"
git push origin main
```

2. **Vercel Dashboard**:
- [ ] Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project"
- [ ] Import GitHub repository
- [ ] Select `alritrovo-booking` repo

3. **Environment Variables**:
Aggiungi in Vercel:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
RESEND_API_KEY=re_xxx...
SENDER_EMAIL=noreply@resend.dev
```

4. **Deploy**:
- [ ] Click "Deploy"
- [ ] Attendi build completo
- [ ] URL: `https://alritrovo-booking.vercel.app`

5. **Test Produzione**:
- [ ] Vai a `https://alritrovo-booking.vercel.app/prenota`
- [ ] Submit richiesta prenotazione
- [ ] Verifica email arriva
- [ ] Login admin funziona
- [ ] Calendario funziona

**Checklist**:
- [ ] Repository GitHub aggiornato
- [ ] Vercel project creato
- [ ] Environment variables configurate
- [ ] Deploy successful
- [ ] URL pubblico funzionante
- [ ] Test end-to-end produzione OK

---

### Task 10.3: Integrazione Link Wix (15 min)

**Steps per Owner Sito Wix**:

1. **Accedi a Wix Editor**
2. **Aggiungi Pulsante/Link nel Menu**:
   - Testo: "Prenota Tavolo" o "Prenotazioni"
   - URL: `https://alritrovo-booking.vercel.app/prenota`
   - Target: Nuova finestra (target="_blank")

3. **Opzione Iframe (Alternativa)**:
```html
<!-- In una pagina Wix dedicata "Prenotazioni" -->
<iframe
  src="https://alritrovo-booking.vercel.app/prenota?embedded=true"
  width="100%"
  height="900px"
  frameborder="0"
  style="border: none;"
></iframe>
```

**Test Integrazione**:
- [ ] Link "Prenota Tavolo" nel sito Wix
- [ ] Click → Apre sistema prenotazioni
- [ ] Form funziona
- [ ] Email arrivano
- [ ] Branding coerente (colori Al Ritrovo)

**Checklist**:
- [ ] Link aggiunto a sito Wix
- [ ] Test click da Wix → Form
- [ ] Submit funziona da Wix
- [ ] (Opzionale) Iframe testato

---

### Task 10.4: Documentazione README (10 min)

**File**: `README.md`

```markdown
# 🍽️ Al Ritrovo - Sistema Prenotazioni

Sistema di gestione prenotazioni online per il ristorante **Al Ritrovo** di Bologna.

## 🚀 Features

- ✅ Form pubblico richiesta prenotazioni
- ✅ Dashboard admin per gestione richieste
- ✅ Calendario integrato con FullCalendar
- ✅ Sistema email automatico (Resend)
- ✅ Rate limiting anti-spam (3 richieste/ora)
- ✅ GDPR compliant (Privacy Policy)
- ✅ Responsive mobile/tablet/desktop

## 🛠️ Stack Tecnologico

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend (3000 email/mese gratis)
- **Hosting**: Vercel
- **Auth**: Supabase Auth

## 📦 Installazione Locale

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/alritrovo-booking.git
cd alritrovo-booking

# Install dependencies
npm install

# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local with your keys
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
RESEND_API_KEY=your_resend_key
SENDER_EMAIL=noreply@resend.dev

# Run development server
npm run dev
```

## 🔑 Environment Variables

### Frontend (Vercel)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon key
- `RESEND_API_KEY`: Resend API key (Fase A)
- `SENDER_EMAIL`: noreply@resend.dev (Fase A)

### Supabase Edge Functions
```bash
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set SENDER_EMAIL=noreply@resend.dev
```

## 📧 Email System

**Fase A (Attuale)**: Email da `noreply@resend.dev`
- Gratis, nessuna verifica DNS
- Ideale per sviluppo e test

**Fase B (Futuro)**: Email da `prenotazioni@alritrovo.com`
- Richiede dominio custom e verifica DNS
- Migrazione: 20 minuti
- Guida: Vedi sezione "Migrazione Dominio" sotto

## 🔄 Migrazione a Dominio Custom (Fase A → B)

Quando acquisti dominio `alritrovo.com`:

1. Vai su [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Inserisci `alritrovo.com`
4. Copia 3 record DNS forniti
5. Aggiungi nel provider dominio (Aruba/GoDaddy/etc.):
   ```
   TXT @ resend_verify=xxx
   MX @ feedback-smtp.resend.com (priority 10)
   TXT @ v=spf1 include:resend.com ~all
   ```
6. Attendi verifica (5-10 minuti)
7. Aggiorna variabile su Vercel:
   ```
   SENDER_EMAIL=prenotazioni@alritrovo.com
   ```
8. Aggiorna secret Supabase:
   ```bash
   supabase secrets set SENDER_EMAIL=prenotazioni@alritrovo.com
   ```
9. Redeploy Vercel → Email da dominio custom!

**Tempo totale**: ~20 minuti
**Costo**: Solo dominio (~12€/anno)

## 👤 Admin Login

URL: `https://alritrovo-booking.vercel.app/login`

**Credenziali**:
- Email: (fornite separatamente)
- Password: (fornite separatamente)

## 📚 Database Schema

### Tabelle Principali:
- `booking_requests`: Richieste prenotazioni (pending/accepted/rejected)
- `admin_users`: Utenti admin
- `email_logs`: Log email inviate
- `restaurant_settings`: Configurazione ristorante

### RLS Policies:
- Form pubblico: INSERT only
- Admin: Full access (SELECT/UPDATE/DELETE)

## 🧪 Testing

```bash
# Run tests (se implementati)
npm run test

# Test manuale:
# 1. Form pubblico: http://localhost:5173/prenota
# 2. Admin login: http://localhost:5173/login
# 3. Dashboard: http://localhost:5173/admin
```

## 🚀 Deploy

### Vercel (Frontend)
```bash
git push origin main  # Auto-deploy
```

### Supabase Edge Functions
```bash
supabase functions deploy send-booking-email
supabase functions deploy submit-booking
```

## 📖 Documentation

- [PRD.md](./PRD.md): Product Requirements Document completo
- [PLANNING_TASKS.md](./PLANNING_TASKS.md): Task breakdown e timeline

## 🐛 Troubleshooting

### Email non arrivano
- Controlla spam
- Verifica RESEND_API_KEY configurato
- Check email_logs table per errori

### Rate limiting troppo aggressivo
- Modifica `supabase/functions/submit-booking/index.ts`
- Cambia RATE_LIMIT da 3 a valore desiderato

### Database error
- Verifica RLS policies attive
- Check VITE_SUPABASE_ANON_KEY corretto

## 📞 Support

Email: privacy@alritrovo.com

## 📄 License

© 2025 Al Ritrovo - Bologna. All rights reserved.
```

**Checklist**:
- [ ] README.md creato
- [ ] Tutte le sezioni presenti
- [ ] Environment variables documentate
- [ ] Guida migrazione Fase A→B chiara
- [ ] Troubleshooting utile

---

## ✅ Final Checklist Completo

### Code Quality
- [ ] No console.log in produzione
- [ ] No TODO comments unresolved
- [ ] TypeScript errors: 0
- [ ] ESLint warnings: < 5
- [ ] Codice commentato dove necessario

### Performance
- [ ] Lighthouse Score > 90 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 500KB

### Security
- [ ] No API keys hardcoded
- [ ] RLS policies attive
- [ ] Rate limiting funzionante
- [ ] HTTPS only

### GDPR
- [ ] Privacy Policy presente
- [ ] Checkbox consenso obbligatorio
- [ ] Data retention 2 anni
- [ ] Email privacy@ funzionante

### Documentation
- [ ] README.md completo
- [ ] PLANNING_TASKS.md aggiornato
- [ ] .env.example presente
- [ ] Commit messages chiari

## 🎉 Quando Hai Finito

### Aggiorna PLANNING_TASKS.md
- Segna Fase 9-10 come "✅ Completed"
- Segna milestone 5 come completato
- Cambia tutti gli status "⏳ Pending" in "✅ Completed"

### Deliverables Finali
- [ ] URL produzione: `https://alritrovo-booking.vercel.app`
- [ ] URL admin: `https://alritrovo-booking.vercel.app/login`
- [ ] GitHub repository aggiornato
- [ ] Screenshot dashboard/calendario/email
- [ ] Video demo (opzionale)

### Handoff a Cliente
- [ ] Email con tutti i link
- [ ] Credenziali admin (secure)
- [ ] Guida quick start
- [ ] Guida migrazione Fase B
- [ ] Support contact

---

**Progetto Completato!** 🎊

Tempo totale stimato: **21.5 ore**
Tempo effettivo: _____ ore (da registrare)
