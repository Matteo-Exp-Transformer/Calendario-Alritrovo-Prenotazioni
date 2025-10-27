# 🧪 E2E Testing Suite - Al Ritrovo Booking System

## 📋 Test Coverage

Questa suite contiene 6 test end-to-end che coprono l'intero flusso dell'applicazione:

### Test 1: Flusso Prenotazione Utente ✅
- **File**: `01-booking-flow.spec.ts`
- **Descrizione**: Crea una prenotazione dal form pubblico
- **Email Test**: matteo.cavallaro.work@gmail.com
- **Verifica**: Form submission, validation, success message

### Test 2: Conferma Prenotazione + Email ✅
- **File**: `02-accept-booking.spec.ts`
- **Descrizione**: Admin accetta prenotazione da pendenti
- **Verifica**: Prenotazione va in calendario, email inviata

### Test 3: Rifiuto Prenotazione ❌
- **File**: `03-reject-booking.spec.ts`
- **Descrizione**: Admin rifiuta prenotazione
- **Verifica**: Prenotazione va in archivio come "Rifiutata"

### Test 4: Modifica Prenotazione dal Calendario ✏️
- **File**: `04-edit-booking-calendar.spec.ts`
- **Descrizione**: Click su evento calendario, modifica dettagli
- **Verifica**: Modifiche salvate correttamente

### Test 5: Cancellazione Prenotazione dal Calendario 🗑️
- **File**: `05-delete-booking-calendar.spec.ts`
- **Descrizione**: Click su evento, cancella prenotazione
- **Verifica**: Evento rimosso dal calendario

### Test 6: Archivio con Filtri 📚
- **File**: `06-archive-filters.spec.ts`
- **Descrizione**: Testa filtri Tutte/Accettate/Rifiutate
- **Verifica**: Cards collapsibili, counter, filtri funzionanti

---

## 🚀 Setup

### Prerequisiti
```bash
# Installare Playwright (già fatto)
npm install -D @playwright/test

# Installare browser Chromium
npx playwright install chromium
```

### Configurazione
1. **Server Dev**: Deve essere in esecuzione su `http://localhost:5175`
2. **Database**: Supabase deve essere configurato
3. **Admin Credentials**:
   - Email: `admin@alritrovo.com`
   - Password: `admin123`
   - ⚠️ **IMPORTANTE**: Aggiorna le credenziali nei test se diverse!

---

## 🎯 Esecuzione Test

### Eseguire TUTTI i test in sequenza
```bash
npm run test:e2e
```

### Eseguire un singolo test
```bash
npx playwright test e2e/01-booking-flow.spec.ts
```

### Eseguire con UI interattiva
```bash
npx playwright test --ui
```

### Eseguire in debug mode
```bash
npx playwright test --debug
```

### Vedere report HTML
```bash
npx playwright show-report
```

---

## 📸 Screenshots

I test salvano screenshot automaticamente in `e2e/screenshots/`:

```
e2e/screenshots/
├── 01-form-filled.png
├── 01-after-submit.png
├── 02-admin-dashboard.png
├── 02-pending-requests.png
├── 02-booking-card-expanded.png
├── 02-after-accept.png
├── 02-calendar-with-booking.png
├── 03-pending-before-reject.png
├── 03-booking-card-expanded.png
├── 03-after-reject.png
├── 03-archive-rejected.png
├── 04-calendar-view.png
├── 04-modal-opened.png
├── 04-after-edits.png
├── 04-after-save.png
├── 05-calendar-before-delete.png
├── 05-modal-opened.png
├── 05-after-delete.png
├── 06-archive-initial.png
├── 06-filter-tutte.png
├── 06-filter-accettate.png
├── 06-filter-rifiutate.png
├── 06-card-collapsed.png
├── 06-card-expanded.png
└── 06-archive-final.png
```

---

## 🐛 Debugging

### Se un test fallisce:

1. **Controllare screenshots**: `e2e/screenshots/`
2. **Video**: Salvati in `test-results/` (solo on failure)
3. **Trace**: `npx playwright show-trace test-results/[test-name]/trace.zip`
4. **Console logs**: Ogni test stampa log dettagliati

### Problemi Comuni:

#### Test 1 fallisce
- ✅ Verifica che `/prenota` sia accessibile
- ✅ Controlla validation del form
- ✅ Verifica che Supabase accetti INSERT

#### Test 2 fallisce
- ✅ Controlla credenziali admin
- ✅ Verifica che Test 1 sia stato eseguito prima
- ✅ Controlla che il tab "Pendenti" esista

#### Test 4/5 falliscono
- ✅ Verifica che FullCalendar sia renderizzato
- ✅ Controlla che ci siano eventi nel calendario
- ✅ Verifica che il modal si apra al click

#### Test 6 fallisce
- ✅ Controlla che ci siano prenotazioni in archivio
- ✅ Verifica che i filtri siano visibili
- ✅ Controlla collapse/expand cards

---

## 📝 Note Importanti

### Email Testing
- **Test 2** verifica che email venga inviata dopo accettazione
- ⚠️ Richiede `RESEND_API_KEY` configurato in Supabase
- Se non configurato, test passa ma email non viene inviata
- Controlla `email_logs` table in database per verificare

### Credenziali Admin
**IMPORTANTE**: I test usano queste credenziali:
```typescript
email: 'admin@alritrovo.com'
password: 'admin123'
```

Se le tue credenziali sono diverse:
1. Crea un admin user con queste credenziali, OPPURE
2. Aggiorna le credenziali in ogni test file

### Test Sequence
I test sono progettati per essere eseguiti in sequenza:
```
Test 1 → Crea prenotazione
Test 2 → Accetta quella prenotazione
Test 3 → Crea e rifiuta altra prenotazione
Test 4 → Modifica prenotazione accettata
Test 5 → Cancella prenotazione
Test 6 → Verifica archivio
```

Puoi anche eseguirli singolarmente, ma alcuni test (2,4,5,6) richiedono dati creati da test precedenti.

---

## 🔧 Configurazione Playwright

File: `playwright.config.ts`

```typescript
{
  baseURL: 'http://localhost:5175',
  workers: 1, // Sequenziale (non parallelo)
  retries: 0,  // No retries (per debugging)
  reporter: 'html',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175',
    reuseExistingServer: true
  }
}
```

---

## 🎓 Best Practices

### Quando aggiungere nuovi test:

1. **Naming**: `NN-feature-name.spec.ts`
2. **Structure**: Segui il pattern dei test esistenti
3. **Screenshots**: Salva screenshot nei punti chiave
4. **Logs**: Usa `console.log()` per debugging
5. **Selectors**: Usa text matching dove possibile, fallback a CSS

### Selector Strategy:
```typescript
// ✅ GOOD: Text-based (resistant to refactoring)
page.locator('button:has-text("Accetta")')

// ⚠️ OK: Class-based (fragile)
page.locator('.btn-accept')

// ❌ BAD: Index-based (very fragile)
page.locator('button').nth(3)
```

---

## 📊 Report HTML

Dopo l'esecuzione, visualizza il report:

```bash
npx playwright show-report
```

Il report mostra:
- ✅ Test passati/falliti
- ⏱️ Tempo di esecuzione
- 📸 Screenshots
- 🎥 Video (se falliti)
- 📋 Trace viewer

---

## 🚀 CI/CD Integration

Per eseguire in CI (GitHub Actions, GitLab CI, etc.):

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📞 Support

**Problemi con i test?**
1. Controlla screenshots in `e2e/screenshots/`
2. Leggi i log della console (molto dettagliati)
3. Esegui con `--debug` per step-by-step
4. Controlla questo README per troubleshooting

**Test Status**: ✅ Ready to Run
**Ultima Modifica**: 27 Gennaio 2025
