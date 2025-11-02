# 🧪 E2E Test Suite - Al Ritrovo Booking System

Suite completa di test end-to-end organizzata per categorie funzionali.

## 📁 Struttura Test

I test sono organizzati in cartelle per categoria:

```
e2e/
├── 📁 booking-flow/          # Flusso prenotazione utente pubblico
├── 📁 admin-crud/            # Operazioni CRUD admin (accept, reject, edit, delete)
├── 📁 calendar/              # Funzionalità calendario
├── 📁 menu/                  # Selezione e validazione menu
├── 📁 validation/            # Validazione form e input
├── 📁 ui-visual/             # Test visual e layout
├── 📁 archive/                # Test archivio prenotazioni
├── 📁 time-slots/             # Test time slots e disponibilità
├── 📁 mobile/                 # Test responsive mobile
├── 📁 helpers/                # Helper functions per test
├── 📁 screenshots/            # Screenshot generati dai test
└── 📄 README.md               # Questa guida
```

## 📂 Categorie Test

### 🎫 booking-flow/
**Scopo**: Test del flusso completo prenotazione utente pubblico

- `01-booking-flow.spec.ts` - Crea prenotazione dal form pubblico

**Cosa testa:**
- Compilazione form pubblico `/prenota`
- Validazione campi
- Invio prenotazione
- Messaggio di successo

---

### 👨‍💼 admin-crud/
**Scopo**: Test operazioni CRUD dell'admin dashboard

- `02-accept-booking.spec.ts` - Accetta prenotazione da pendenti
- `03-reject-booking.spec.ts` - Rifiuta prenotazione
- `04-edit-booking-calendar.spec.ts` - Modifica prenotazione dal calendario
- `05-delete-booking-calendar.spec.ts` - Cancella prenotazione
- `11-admin-booking-insertion.spec.ts` - Crea prenotazione da admin
- `comprehensive-admin-flow-test.spec.ts` - Flusso completo CRUD

**Cosa testa:**
- Login admin
- Accettazione/rifiuto prenotazioni
- Modifica prenotazioni esistenti
- Cancellazione prenotazioni
- Creazione prenotazioni da admin

---

### 📅 calendar/
**Scopo**: Test funzionalità calendario

- `05-test-morning-booking.spec.ts` - Visualizzazione prenotazioni mattina
- `13-test-calendar-and-collapse-cards.spec.ts` - Interazione calendario e cards
- `15-test-view-in-calendar-from-archive.spec.ts` - Navigazione archivio → calendario

**Cosa testa:**
- Rendering FullCalendar
- Visualizzazione eventi per fascia oraria
- Integrazione con collapse cards
- Navigazione tra viste

---

### 🍽️ menu/
**Scopo**: Test selezione e validazione menu

- `07-menu-field.spec.ts` - Campo menu in form
- `test-menu-selection-limits.spec.ts` - Limiti selezione per categoria
- `test-menu-auto-deselection.spec.ts` - Deselezione automatica
- `test-menu-no-bis-primi.spec.ts` - Restrizione "bis primi"
- `verify-menu-limits-implementation.spec.ts` - Verifica implementazione limiti
- `final-menu-verification.spec.ts` - Verifica finale sistema menu
- `verify-menu-fresh.spec.ts` - Verifica menu aggiornato
- `final-duplicate-verification.spec.ts` - Verifica assenza duplicati

**Cosa testa:**
- Selezione voci menu
- Limit per categoria (max 3 antipasti, max 1 primo, etc.)
- Mutual exclusion (bevande, pizza/focaccia)
- Validazione regole business
- Integrità dati menu

---

### ✅ validation/
**Scopo**: Test validazione form

- `16-test-email-phone-validation.spec.ts` - Validazione email e telefono

**Cosa testa:**
- Email opzionale vs obbligatorio
- Telefono obbligatorio
- Validazione form pubblico e admin

---

### 🎨 ui-visual/
**Scopo**: Test visual e layout UI

- `final-visual-verification-simple.spec.ts` - Verifica visual completa dashboard
- `10-test-modal-two-columns.spec.ts` - Layout modale a due colonne
- `visual-check.spec.ts` - Check visual generale
- `visual-admin-check.spec.ts` - Check visual admin
- `visual-form-layout-test.spec.ts` - Layout form prenotazione
- `final-snapshot.spec.ts` - Snapshot finale
- `test-admin-ui-modernization.spec.ts` - Modernizzazione UI admin
- `test-header-layout.spec.ts` - Layout header
- `test-header-spacing-and-fonts.spec.ts` - Spaziatura e font header
- `test-admin-header-modifications.spec.ts` - Modifiche header admin
- `test-card-borders.spec.ts` - Bordi cards
- `test-dashboard-buttons.spec.ts` - Bottoni dashboard
- `test-logout-button.spec.ts` - Bottone logout
- `test-logout-position.spec.ts` - Posizione logout
- `test-user-info-position.spec.ts` - Posizione info utente

**Cosa testa:**
- Layout responsive
- Styling componenti
- Posizionamento elementi
- Screenshot comparison

---

### 📚 archive/
**Scopo**: Test archivio prenotazioni

- `06-archive-filters.spec.ts` - Filtri archivio (Tutte/Accettate/Rifiutate)
- `test-archive-cards.spec.ts` - Cards archivio collapsibili

**Cosa testa:**
- Filtri archivio
- Visualizzazione prenotazioni accettate/rifiutate
- Cards collapsibili
- Counter prenotazioni

---

### ⏰ time-slots/
**Scopo**: Test time slots e disponibilità

- `08-test-afternoon-booking.spec.ts` - Assegnazione slot pomeriggio
- `14-test-time-slot-assignment.spec.ts` - Edge cases assegnazione slot
- `bugfix-time-slot-collapse-cards.spec.ts` - Fix collapse cards time slots
- `test-collapse-cards.spec.ts` - Cards time slots

**Cosa testa:**
- Classificazione slot (Mattina/Pomeriggio/Sera)
- Assegnazione automatica slot
- Edge cases (crossover mezzanotte, etc.)
- Interazione collapse cards

---

### 📱 mobile/
**Scopo**: Test responsive mobile

- `09-test-modal-mobile-size.spec.ts` - Dimensioni modale mobile
- `test-archive-mobile.spec.ts` - Archivio mobile
- `mobile-test.spec.ts` - Test mobile generale
- `quick-mobile-test.spec.ts` - Test mobile veloce
- `test-time-input-00-30-mobile.spec.ts` - Input time mobile

**Cosa testa:**
- Layout responsive
- Dimensioni modale su mobile
- Touch interactions
- Viewport piccoli (320px, 768px)

---

## 🚀 Esecuzione Test

### Eseguire tutti i test
```bash
npm run test:e2e
```

### Eseguire test per categoria
```bash
# Solo booking flow
npx playwright test e2e/booking-flow/

# Solo admin CRUD
npx playwright test e2e/admin-crud/

# Solo menu
npx playwright test e2e/menu/
```

### Eseguire singolo test
```bash
npx playwright test e2e/booking-flow/01-booking-flow.spec.ts
```

### Eseguire con UI interattiva
```bash
npm run test:e2e:ui
# Oppure
npx playwright test --ui
```

### Debug mode
```bash
npm run test:e2e:debug
# Oppure
npx playwright test --debug
```

### Vedere report
```bash
npm run test:report
# Oppure
npx playwright show-report
```

## 📸 Screenshots

I test salvano screenshot automaticamente in `e2e/screenshots/` organizzati per categoria.

## 🔧 Configurazione

File: `playwright.config.ts`

```typescript
{
  testDir: './e2e',
  testMatch: /.*\.spec\.ts$/,  // Cerca in tutte le sottocartelle
  baseURL: 'http://localhost:5175',
  workers: 1, // Sequenziale (non parallelo)
  reporter: 'html',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175',
    reuseExistingServer: true
  }
}
```

## 🔐 Credenziali Test

I test usano queste credenziali admin:
- **Email**: `0cavuz0@gmail.com`
- **Password**: `Cavallaro`

⚠️ **IMPORTANTE**: L'utente admin deve esistere in Supabase prima di eseguire i test.

## 📝 Note Importanti

### Sequenza Test
Alcuni test richiedono che altri siano eseguiti prima:
- `02-accept-booking.spec.ts` richiede che `01-booking-flow.spec.ts` sia eseguito prima
- `04-edit-booking-calendar.spec.ts` richiede una prenotazione accettata
- `05-delete-booking-calendar.spec.ts` richiede una prenotazione accettata

### Test con Skip
Alcuni test potrebbero avere `test.skip()` per saltare automaticamente:
- Test che richiedono setup manuale
- Test che testano feature non ancora implementate
- Test temporaneamente disabilitati per debugging

### Helpers
Funzioni helper condivise in `e2e/helpers/`:
- `auth.ts` - Funzioni per login admin

## 🐛 Troubleshooting

### Test fallisce con errore login
- Verifica credenziali admin in Supabase
- Controlla che l'utente esista e sia autenticabile

### Test fallisce per selector non trovato
- Verifica che l'app sia in esecuzione su `http://localhost:5175`
- Controlla screenshots in `e2e/screenshots/` per vedere lo stato della pagina

### Test fallisce per timeout
- Aumenta timeout nel test
- Verifica che il server dev sia in esecuzione
- Controlla che non ci siano errori in console

## 📊 Statistiche

- **Totale test**: ~57 test organizzati
- **Categorie**: 9 categorie funzionali
- **Copertura**: Booking flow, Admin CRUD, Calendar, Menu, Validation, UI, Archive, Time slots, Mobile

## 🎯 Best Practices

1. **Naming**: Usa nomi descrittivi `test-feature-name.spec.ts`
2. **Organization**: Metti test nella categoria corretta
3. **Screenshots**: Salva screenshot nei punti chiave
4. **Logs**: Usa `console.log()` per debugging
5. **Selectors**: Preferisci text matching, evita selettori fragili

---

**Ultimo aggiornamento**: Gennaio 2025
**Status**: ✅ Test organizzati e funzionanti
