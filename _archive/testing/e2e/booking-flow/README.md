# Test E2E - Booking Flow

Questa cartella contiene i test end-to-end per il sistema di prenotazioni.

## ⚠️ IMPORTANTE: Prima di eseguire i test

**Assicurati che l'applicazione sia in esecuzione:**
```bash
npm run dev
```

L'applicazione deve essere raggiungibile su `http://localhost:5173` (o la porta configurata).

---

## Test Disponibili

### 01-insert-booking.spec.ts
**Scopo**: Inserire una nuova prenotazione nel sistema.

**Quando usarlo**: Quando vuoi testare l'inserimento di una prenotazione o creare dati di test.

**Come modificare i dati**:
1. Apri `01-insert-booking.spec.ts`
2. Modifica i valori nella sezione "CONFIGURAZIONE" (righe ~28-54):
   
   ```typescript
   // 📅 DATA: Modifica questa riga per cambiare la data
   const bookingDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; 
   
   // ⏰ ORARIO: Modifica questa riga per cambiare l'orario (formato: HH:MM)
   const bookingTime = '20:30';
   
   // 👤 NOME: Modifica questa riga per cambiare il nome
   const clientName = `Test User ${timestamp}`;
   
   // 👥 OSPITI: Modifica questa riga per cambiare il numero di ospiti
   const numGuests = '4';
   ```

**Esempi di data**:
```typescript
// Data tra 7 giorni
const bookingDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

// Data tra 14 giorni
const bookingDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

// Data specifica
const bookingDate = '2025-12-25';
```

**Esecuzione**:
```bash
npm run test:e2e -- e2e/booking-flow/01-insert-booking.spec.ts
```

**Se il test fallisce**:
1. Controlla che l'app sia in esecuzione (`npm run dev`)
2. Verifica lo screenshot salvato in `e2e/screenshots/insert-03-after-submit.png`
3. Controlla se ci sono errori di validazione nel form
4. Verifica manualmente se la prenotazione è stata creata nel database

---

### 02-verify-time-transcription.spec.ts
**Scopo**: Verificare che l'orario inserito sia preservato correttamente in tutte le fasi (pending → calendario → modal).

**Quando usarlo**: Per verificare che non ci siano problemi di conversione timezone.

**Esecuzione**:
```bash
npm run test:e2e -- e2e/booking-flow/02-verify-time-transcription.spec.ts
```

---

### 03-reject-booking.spec.ts
**Scopo**: Testare il flusso di rifiuto di una prenotazione.

**Quando usarlo**: Per verificare la funzionalità di rifiuto prenotazioni.

**Esecuzione**:
```bash
npm run test:e2e -- e2e/booking-flow/03-reject-booking.spec.ts
```

---

### 04-modify-booking.spec.ts
**Scopo**: Testare la modifica di una prenotazione accettata.

**Quando usarlo**: Per verificare che le modifiche alle prenotazioni funzionino correttamente.

**Esecuzione**:
```bash
npm run test:e2e -- e2e/booking-flow/04-modify-booking.spec.ts
```

---

### 05-cancel-booking.spec.ts
**Scopo**: Testare la cancellazione di una prenotazione.

**Quando usarlo**: Per verificare la funzionalità di cancellazione prenotazioni.

**Esecuzione**:
```bash
npm run test:e2e -- e2e/booking-flow/05-cancel-booking.spec.ts
```

---

### 06-complete-booking-flow.spec.ts
**Scopo**: Test completo che verifica l'intero flusso: inserimento → accettazione → verifica orario nel calendario.

**Quando usarlo**: Per testare l'intero ciclo di vita di una prenotazione.

**Esecuzione**:
```bash
npm run test:e2e -- e2e/booking-flow/06-complete-booking-flow.spec.ts
```

---

## Guida Rapida - Modificare Dati Prenotazione

### Per cambiare la DATA:
```typescript
// In 01-insert-booking.spec.ts, riga ~33
const bookingDate = '2025-12-25'; // Modifica questa riga
```

### Per cambiare l'ORARIO:
```typescript
// In 01-insert-booking.spec.ts, riga ~36
const bookingTime = '19:00'; // Modifica questa riga (formato HH:MM)
```

### Per cambiare il NOME:
```typescript
// In 01-insert-booking.spec.ts, riga ~39
const clientName = 'Mario Rossi'; // Modifica questa riga
```

### Per cambiare il numero di OSPITI:
```typescript
// In 01-insert-booking.spec.ts, riga ~48
const numGuests = '6'; // Modifica questa riga
```

---

## Comandi Utili

### Eseguire un test specifico:
```bash
npm run test:e2e -- e2e/booking-flow/01-insert-booking.spec.ts
```

### Eseguire con UI interattiva (debug):
```bash
npm run test:e2e:ui
```

### Eseguire in modalità debug:
```bash
npm run test:e2e:debug -- e2e/booking-flow/01-insert-booking.spec.ts
```

### Vedere il report dei test:
```bash
npm run test:report
```

---

## Troubleshooting

### Test fallisce con "Cannot find element"
- Verifica che l'app sia in esecuzione: `npm run dev`
- Controlla che la porta sia corretta (default: 5173)
- Verifica lo screenshot salvato

### Test fallisce con "Timeout"
- Aumenta il timeout nel test o in `playwright.config.ts`
- Verifica la connessione internet
- Controlla che l'app risponda correttamente

### Test fallisce verificando il successo
- Controlla lo screenshot in `e2e/screenshots/`
- Verifica manualmente se la prenotazione è stata creata
- Controlla la console del browser per errori

---

## Note

- Tutti i test generano email uniche usando un timestamp
- I test richiedono che l'applicazione sia in esecuzione (`npm run dev`)
- Gli screenshot vengono salvati in `e2e/screenshots/`
- I test usano un browser headless di default
