# 🧪 Testing Checklist - Al Ritrovo Booking System

**Data**: 27 Gennaio 2025
**Versione**: 3.2 (Post UI Redesign)
**Status**: In Testing

---

## 🎨 UI/UX Testing

### Dashboard Admin (/admin)

#### Header & Navigation
- [ ] Header gradient indigo-purple-pink visibile correttamente
- [ ] Logo "Al Ritrovo" e sottotitolo visibili
- [ ] User info card mostra nome/email/ruolo correttamente
- [ ] Avatar icon giallo-arancio visibile
- [ ] Logout button funziona (hover rosso, scale effect)
- [ ] Navigation tabs orizzontali responsive
- [ ] Tab attivo mostra gradient giallo-arancio
- [ ] Badge pendenti (rosso pulse) visibile se > 0
- [ ] Mobile: navigation wrap correttamente

#### Stats Cards
- [ ] 3 cards visibili: Pendenti (arancio), Accettate (verde), Totale (blu)
- [ ] Numeri corretti e formattati
- [ ] Icone visibili e colorate
- [ ] Border bianco/20 presente
- [ ] NO animazioni hover (statico)
- [ ] Responsive: 1 colonna mobile, 3 desktop

#### Background
- [ ] Gradient blu-viola-rosa soft visibile
- [ ] Non interferisce con leggibilità contenuto

---

## 📋 Tab: Prenotazioni Pendenti

### Collapse Cards
- [ ] Cards chiuse mostrano TUTTI i dati:
  - [ ] Icona tipo evento (cena/aperitivo/evento/laurea)
  - [ ] Tipo evento e nome cliente
  - [ ] Data, ora, numero ospiti (badge colorati)
  - [ ] Email e telefono
  - [ ] Preview note (line-clamp-1)
  - [ ] Badge status "Pendente"
  - [ ] Chevron down/up
- [ ] Click su card apre/chiude correttamente
- [ ] Animazione slideDown smooth
- [ ] Sezione "Dati Cliente" evidenziata con gradient
- [ ] Note complete visibili quando aperta
- [ ] Bottoni "Accetta Prenotazione" e "Rifiuta" XL size
- [ ] Hover su header: cambio colore background

### Funzionalità Bottoni
- [ ] **ACCETTA**:
  - [ ] Apre modal o conferma immediata
  - [ ] Toast success appare
  - [ ] Prenotazione scompare da pendenti
  - [ ] Appare in calendario
  - [ ] (Se email attiva) Email inviata al cliente
- [ ] **RIFIUTA**:
  - [ ] Apre modal per motivo rifiuto
  - [ ] Toast success appare
  - [ ] Prenotazione scompare da pendenti
  - [ ] Appare in archivio con status "Rifiutata"
  - [ ] (Se email attiva) Email rifiuto inviata

### Empty State
- [ ] Nessuna richiesta: mostra messaggio "Nessuna richiesta in attesa"
- [ ] Icona ✅ grande visibile
- [ ] Messaggio centrato e chiaro

---

## 📅 Tab: Calendario

### FullCalendar Display
- [ ] Calendario visualizzato correttamente
- [ ] Vista mese di default
- [ ] Bottoni vista: mese/settimana/giorno/multimonth funzionano
- [ ] Eventi (prenotazioni accettate) visibili
- [ ] Colori eventi corretti per tipo:
  - [ ] Cena: rosso scuro
  - [ ] Aperitivo: oro
  - [ ] Evento: viola
  - [ ] Laurea: turchese

### Eventi Calendario
- [ ] Titolo evento mostra: "Nome Cliente - X ospiti"
- [ ] Click su evento apre modal
- [ ] Modal mostra tutti i dettagli prenotazione
- [ ] Bottoni "Modifica" e "Cancella" visibili
- [ ] Modifica: salva correttamente
- [ ] Cancella: rimuove evento e aggiorna DB

### Responsive
- [ ] Mobile: calendario si adatta allo schermo
- [ ] Touch events funzionano su mobile

---

## 📚 Tab: Archivio

### Filtri
- [ ] 3 bottoni filtro visibili: Tutte / Accettate / Rifiutate
- [ ] Filtro attivo: gradient indigo-purple con shadow
- [ ] Filtro inattivo: bianco con hover indigo-100
- [ ] Scale effect (105%) su hover
- [ ] Background gradient indigo-purple-50
- [ ] Border indigo-100

### Counter Prenotazioni
- [ ] Badge "Mostrando X prenotazioni" visibile
- [ ] Numero aggiornato in base al filtro
- [ ] Colore indigo su sfondo indigo-50

### Collapse Cards Archivio
- [ ] Cards chiuse mostrano:
  - [ ] Icona tipo evento
  - [ ] Tipo evento + nome cliente
  - [ ] Data, ora, ospiti (badge bianchi)
  - [ ] Data creazione (piccola sotto)
  - [ ] Badge status colorato (verde/rosso/giallo)
  - [ ] Chevron down/up
- [ ] Click apre/chiude card
- [ ] Animazione slideDown smooth
- [ ] Sezione "Dati Cliente" con gradient indigo-purple
- [ ] Email e telefono visibili
- [ ] Note speciali (se presenti) in box blu
- [ ] Motivo rifiuto (se presente) in box rosso
- [ ] Border indigo-200

### Empty State
- [ ] Messaggio "Nessuna prenotazione" con icona 📭
- [ ] Gradient purple-pink background
- [ ] Suggerimento "Prova a cambiare filtro"

---

## ⚙️ Tab: Impostazioni

### Header
- [ ] Icon box gradient indigo-purple con Settings icon
- [ ] Titolo "Impostazioni Sistema" grande e bold

### Info Box Stato Sistema
- [ ] Gradient blu-indigo con border blu
- [ ] Icon Bell in cerchio bianco/20
- [ ] Testo bianco leggibile
- [ ] Messaggio "95% produzione" presente

### Settings Cards (4 cards)
- [ ] Gradient white → purple-50/50
- [ ] Border purple-200
- [ ] Icon box gradient indigo-purple-100
- [ ] Titoli bold indigo-900
- [ ] Status colorati (verde/rosso/giallo)
- [ ] Hover: shadow-xl
- [ ] Cards:
  - [ ] Notifiche Email (status basato su RESEND_API_KEY)
  - [ ] Rate Limiting (✅ Attivo)
  - [ ] Cookie Consent (✅ Attivo)
  - [ ] RLS Policies (⚠️ Temporaneo)

### Environment Variables
- [ ] Box gradient purple-pink
- [ ] Icon Database in box indigo-600
- [ ] Lista 4 variabili:
  - [ ] VITE_SUPABASE_URL (✅/❌)
  - [ ] VITE_SUPABASE_ANON_KEY (✅/❌)
  - [ ] RESEND_API_KEY (✅/❌)
  - [ ] VITE_SUPABASE_SERVICE_ROLE_KEY (⚠️)

### Action Buttons
- [ ] Test Email: Gradient blu-indigo, hover scale
- [ ] View Logs: Gradient purple-pink, hover scale
- [ ] Export Settings: Outline indigo, hover scale
- [ ] Click Test Email apre modal
- [ ] Click View Logs apre modal
- [ ] Export mostra alert "da implementare"

---

## 📝 Form Pubblico (/prenota)

### Layout & Design
- [ ] Gradient background: warm-wood → warm-orange → terracotta
- [ ] Card centrale glassmorphism (bg-white/95 backdrop-blur)
- [ ] Shadow-2xl visibile
- [ ] Rounded-3xl corners
- [ ] 2 colonne: dati personali | dati prenotazione
- [ ] Responsive: 1 colonna su mobile

### Campi Form
- [ ] **Nome completo**: input text, required
- [ ] **Email**: input email, validation formato, required
- [ ] **Telefono**: input tel, optional
- [ ] **Tipo evento**: select con 4 opzioni
- [ ] **Data desiderata**: date picker, min=today
- [ ] **Orario**: time picker, optional
- [ ] **Numero ospiti**: number input 1-50
- [ ] **Note**: textarea, optional
- [ ] **Checkbox Privacy**: required, link a /privacy

### Validazione
- [ ] Campi required mostrano errore se vuoti
- [ ] Email: formato valido richiesto
- [ ] Data: non nel passato
- [ ] Submit disabled finché form invalido

### Submission
- [ ] Click submit: loading state
- [ ] Rate limiting: max 3 richieste/ora
- [ ] Success: toast verde + redirect/reset
- [ ] Error: toast rosso con messaggio
- [ ] Dati salvati in DB (booking_requests)
- [ ] (Se email attiva) Email "richiesta ricevuta" inviata

---

## 🔐 Login & Auth (/login)

### Login Page
- [ ] Form centrato con card bianca
- [ ] Input email e password
- [ ] Bottone "Login" funzionante
- [ ] Error: credenziali invalide → toast rosso
- [ ] Success: redirect a /admin
- [ ] Remember me checkbox (opzionale)

### Protected Routes
- [ ] /admin richiede autenticazione
- [ ] Non autenticato: redirect a /login
- [ ] Token salvato in localStorage/sessionStorage
- [ ] Logout pulisce token e redirect a /login

### AdminHeader User Info
- [ ] Nome/email utente visibili
- [ ] Ruolo (Admin/Staff) visibile con icon Shield
- [ ] Avatar icon giallo-arancio
- [ ] Logout button funziona

---

## 🗄️ Database & Backend

### Supabase Connection
- [ ] VITE_SUPABASE_URL configurato
- [ ] VITE_SUPABASE_ANON_KEY configurato
- [ ] Connessione al DB funzionante
- [ ] Queries execute senza errori

### Tables
- [ ] **booking_requests**: CRUD funzionante
- [ ] **admin_users**: Auth funzionante
- [ ] **email_logs**: Log email salvati (se attivo)
- [ ] **restaurant_settings**: Lettura settings

### RLS Policies
- [ ] Form pubblico: INSERT su booking_requests
- [ ] Admin: SELECT/UPDATE su booking_requests
- [ ] Admin: SELECT su email_logs
- [ ] (Attualmente workaround con SERVICE_ROLE_KEY)

---

## 📧 Email System (Se RESEND_API_KEY configurato)

### Edge Function
- [ ] Function `send-booking-email` deployed
- [ ] Secrets configurati in Supabase:
  - [ ] RESEND_API_KEY
  - [ ] SENDER_EMAIL (noreply@resend.dev)
- [ ] Function richiamabile da triggers

### Email Templates
- [ ] **Richiesta ricevuta**: inviata al submit form
- [ ] **Prenotazione confermata**: inviata all'accettazione
- [ ] **Prenotazione rifiutata**: inviata al rifiuto
- [ ] Template HTML leggibili e branded
- [ ] Link e informazioni corrette

### Email Logs
- [ ] Log salvato in `email_logs` table
- [ ] Status: sent/failed
- [ ] Provider response salvato
- [ ] Modal "View Email Logs" mostra logs

---

## 🚨 Critical Blockers (Da Risolvere)

### 1. Email Secrets Non Configurati ❌
**Impatto**: Email non funzionanti
**Fix**:
```bash
# Su Supabase Dashboard → Settings → Edge Functions → Secrets
RESEND_API_KEY=re_XoehnRJ5_...
SENDER_EMAIL=noreply@resend.dev
```

### 2. RLS Policies Incomplete ⚠️
**Impatto**: Workaround con SERVICE_ROLE_KEY (sicurezza ridotta)
**Fix**: Rigenerare types e fixare policies

### 3. TypeScript @ts-nocheck ⚠️
**Impatto**: Type safety ridotta in alcuni hooks
**Fix**: Rigenerare types Supabase e rimuovere @ts-nocheck

---

## ✅ Testing Passed (Da Spuntare Durante Test)

### UI/UX
- [ ] Tutti i colori professionali visibili
- [ ] Gradienti smooth senza artefatti
- [ ] Animazioni smooth (no lag)
- [ ] Responsive su mobile (iPhone/Android)
- [ ] Responsive su tablet (iPad)
- [ ] Desktop (1920x1080, 1366x768)

### Funzionalità Core
- [ ] Creazione prenotazione da form pubblico
- [ ] Visualizzazione in pendenti
- [ ] Accettazione prenotazione → calendario
- [ ] Rifiuto prenotazione → archivio
- [ ] Filtri archivio funzionanti
- [ ] Collapse cards smooth

### Performance
- [ ] Caricamento iniziale < 2 secondi
- [ ] Navigazione tra tab instant
- [ ] Query DB < 500ms
- [ ] No memory leaks (DevTools)

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## 🐛 Bugs Known (Da Documentare Durante Test)

### High Priority
- [ ] (Nessuno al momento)

### Medium Priority
- [ ] (Da compilare durante testing)

### Low Priority
- [ ] CSS warning @import fonts (non bloccante)

---

## 📊 Test Results Summary

**Total Tests**: 150+
**Passed**: ___ / 150+
**Failed**: ___ / 150+
**Blocked**: 3 (email secrets, RLS, ts-nocheck)

**Overall Status**: 🟡 In Progress

---

**Tester**: Claude Code Agent
**Prossimo Step**: Eseguire testing manuale con utente reale
