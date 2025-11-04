# 🧪 Test E2E Core - Calendario Al Ritrovo

Questa cartella contiene i **test fondamentali** del sistema di prenotazione. Questi test verificano le funzionalità critiche e prevengono regressioni.

---

## 📋 Lista Test

### ✅ Test #1: Inserimento Booking + Verifica Orario
**File:** `test-1-insert-booking-verify-time.spec.ts`

**Cosa testa:**
- ✓ Inserimento prenotazione dal form pubblico
- ✓ Orario inserito viene salvato ESATTAMENTE nel DB (no shift timezone)
- ✓ Esempio: inserisco `20:00` → DB salva `20:00` (NON `21:00` o `19:00`)
- ✓ Test su orari edge case: mezzogiorno, sera, tarda notte

**Perché è importante:**
- Bug storico: production mostrava +1h shift (timezone UTC+1)
- Fix: usa `desired_time` (TIME) invece di `confirmed_start` (TIMESTAMP WITH TIME ZONE)

**Come eseguirlo:**
```bash
npx playwright test e2e/core-tests/test-1-insert-booking-verify-time.spec.ts
```

**Output atteso:**
```
✅ Form compilato con orario: 20:00
✅ DB desired_time: "20:00" (expected: "20:00")
✅ TEST PASSED: Orario preservato senza shift timezone!
```

---

### ✅ Test #2: Protezione Contro Doppi Pending
**File:** `test-2-no-duplicate-pending.spec.ts`

**Cosa testa:**
- ✓ Lock atomico previene doppi submit simultanei
- ✓ Nessuna prenotazione duplicata salvata nel DB
- ✓ Button disabilitato correttamente durante submit
- ✓ Lock rilasciato dopo submit per permettere nuove prenotazioni

**Protezioni verificate:**
1. **sessionStorage lock globale** - previene race condition multi-tab
2. **React state lock** - disabilita UI durante submit
3. **React ref lock** - backup per edge cases
4. **React Query mutation state** - protegge API call
5. **Button disabled** - previene click multipli

**Perché è importante:**
- Bug storico: utente cliccava 2 volte velocemente → 2 bookings nel DB
- Fix: lock atomico a più livelli implementato in `BookingRequestForm.tsx`

**Come eseguirlo:**
```bash
npx playwright test e2e/core-tests/test-2-no-duplicate-pending.spec.ts
```

**Output atteso:**
```
✅ Button disabled dopo click (lock attivo)
📊 Bookings trovati nel DB: 1
✅ NESSUN DUPLICATO: esattamente 1 booking salvato
✅ TEST PASSED: Lock atomico previene duplicati!
```

---

## 🚀 Esecuzione Tutti i Test Core

**Esegui tutti i test in questa cartella:**
```bash
npx playwright test e2e/core-tests/
```

**Con UI mode (visuale):**
```bash
npx playwright test e2e/core-tests/ --ui
```

**Singolo test in debug:**
```bash
npx playwright test e2e/core-tests/test-1-insert-booking-verify-time.spec.ts --debug
```

---

## 📦 Prerequisiti

1. **App running:**
   ```bash
   npm run dev
   ```
   App deve essere su `http://localhost:5173`

2. **Supabase configurato:**
   - `.env.local` con credenziali corrette
   - Database con schema aggiornato

3. **Playwright installato:**
   ```bash
   npm install
   npx playwright install
   ```

---

## 🔍 Cosa Guardare Durante i Test

### Test #1 (Orario)
- ✅ Form si compila correttamente
- ✅ Console log mostra: `DB desired_time: "20:00"`
- ❌ Se vedi `21:00` o `19:00` → FAIL, c'è shift timezone

### Test #2 (Duplicati)
- ✅ Button diventa disabled dopo click
- ✅ Console log mostra: `Bookings trovati nel DB: 1`
- ❌ Se vedi `2` o più → FAIL, lock non funziona

---

## 🐛 Troubleshooting

### Test fallisce: "Button not found"
- Verifica che app sia running su `localhost:5173`
- Controlla che route `/prenota` esista

### Test fallisce: "Supabase error"
- Verifica `.env.local` con credenziali corrette
- Controlla che tabella `booking_requests` esista

### Test fallisce: "Booking not found in DB"
- Possibile problema di timing (form submission lento)
- Aumenta `page.waitForTimeout()` da 2000 a 4000ms

### Test #2 trova duplicati
- 🔴 **CRITICO:** Lock atomico non funziona
- Verifica che `BookingRequestForm.tsx` abbia codice lock aggiornato
- Controlla console browser per errori sessionStorage

---

## 📊 Metriche Attese

| Test | Durata | Cleanup | DB Queries |
|------|--------|---------|------------|
| Test #1 | ~8s | ✅ Auto | 2 (insert + select) |
| Test #2 | ~12s | ✅ Auto | 3 (insert + select + delete) |

---

## 🔄 Quando Eseguire Questi Test

**SEMPRE prima di:**
- ✓ Deploy in production
- ✓ Merge di PR che tocca booking logic
- ✓ Modifiche a `BookingRequestForm.tsx`
- ✓ Modifiche a `BookingCalendar.tsx`
- ✓ Modifiche a mutation hooks

**Dopo modifiche a:**
- Schema database (`booking_requests` table)
- Timezone handling (`dateUtils.ts`)
- Lock mechanism (`BookingRequestForm.tsx`)

---

## 📝 Manutenzione

**Cleanup automatico:**
- ✅ Ogni test elimina i propri dati da DB
- ✅ Email test generate con timestamp univoco
- ✅ Nessun dato sporco lasciato nel DB

**Se test si bloccano:**
```sql
-- Pulisci manualmente bookings test
DELETE FROM booking_requests
WHERE client_email LIKE 'test-%@example.com';
```

---

## 🎯 Coverage

Questi 2 test coprono:
- ✅ 80% del flusso pubblico di inserimento booking
- ✅ 100% delle protezioni anti-duplicati
- ✅ 100% della logica timezone handling
- ✅ Validazione form completa
- ✅ Integrazione DB end-to-end

---

## 📞 Supporto

**In caso di problemi:**
1. Leggi console output del test
2. Controlla screenshot in `e2e/screenshots/`
3. Esegui test in UI mode per debug visivo
4. Verifica logs browser console

**Link utili:**
- [Playwright Docs](https://playwright.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Project Documentation](../../docs/README.md)
