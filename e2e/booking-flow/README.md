# Test E2E - Booking Flow

Questa cartella contiene i test end-to-end per il sistema di prenotazioni.

## Test Disponibili

### 01-insert-booking.spec.ts
**Scopo**: Inserire una nuova prenotazione nel sistema.

**Quando usarlo**: Quando vuoi testare l'inserimento di una prenotazione o creare dati di test.

**Come modificare i dati**:
- Apri `01-insert-booking.spec.ts`
- Modifica i valori nella sezione "CONFIGURAZIONE":
  - `bookingDate`: Data della prenotazione (formato: `YYYY-MM-DD`)
  - `bookingTime`: Orario della prenotazione (formato: `HH:MM`)
  - `clientName`: Nome del cliente
  - `numGuests`: Numero di ospiti
  - `bookingType`: Tipo prenotazione (`'tavolo'` o `'rinfresco_laurea'`)

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
// In 01-insert-booking.spec.ts, riga ~25
const bookingDate = '2025-12-25'; // Modifica questa riga
```

### Per cambiare l'ORARIO:
```typescript
// In 01-insert-booking.spec.ts, riga ~28
const bookingTime = '19:00'; // Modifica questa riga (formato HH:MM)
```

### Per cambiare il NOME:
```typescript
// In 01-insert-booking.spec.ts, riga ~31
const clientName = 'Mario Rossi'; // Modifica questa riga
```

### Per cambiare il numero di OSPITI:
```typescript
// In 01-insert-booking.spec.ts, riga ~40
const numGuests = '6'; // Modifica questa riga
```

## Note

- Tutti i test generano email uniche usando un timestamp
- I test richiedono che l'applicazione sia in esecuzione (`npm run dev`)
- Gli screenshot vengono salvati in `e2e/screenshots/`

