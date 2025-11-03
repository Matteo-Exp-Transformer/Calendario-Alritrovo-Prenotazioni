# Verifica Flusso Completo Prenotazione - Trascrizione Dati

## Obiettivo
Verificare che i dati inseriti dall'utente (data, orario inizio, orario fine) rimangano **IDENTICI** in tutte le fasi del flusso di prenotazione, senza shift di timezone o modifiche.

## Flusso Completo Mappato

### Fase 1: Inserimento Dati (AcceptBookingModal)
**Posizione:** `src/features/booking/components/AcceptBookingModal.tsx`
**Input utente:** 
- Data: `2025-01-15`
- Orario inizio: `20:00`
- Orario fine: `23:00`

**Funzione utilizzata:** `createBookingDateTime(date, time, isStart, startTime)`
**Output:** 
- `confirmedStart = "2025-01-15T20:00:00+00:00"`
- `confirmedEnd = "2025-01-15T23:00:00+00:00"`

**Verifica:**
- ✅ `extractDateFromISO(confirmedStart)` deve restituire `"2025-01-15"`
- ✅ `extractTimeFromISO(confirmedStart)` deve restituire `"20:00"`
- ✅ `extractTimeFromISO(confirmedEnd)` deve restituire `"23:00"`

### Fase 2: Salvataggio nel Database
**Posizione:** `src/features/booking/hooks/useBookingMutations.ts`
**Funzione:** `useAcceptBooking`
**Azione:** Salva `confirmed_start` e `confirmed_end` in PostgreSQL

**Verifica:**
- ✅ PostgreSQL riceve `"2025-01-15T20:00:00+00:00"`
- ✅ PostgreSQL riceve `"2025-01-15T23:00:00+00:00"`
- ✅ Nessuna conversione timezone da parte del database (timestamp rimane identico)

### Fase 3: Visualizzazione Pending Requests
**Posizione:** `src/features/booking/components/PendingRequestsTab.tsx`
**Nota:** Le prenotazioni pending NON usano `confirmed_start` (non ancora confermate)

### Fase 4: Visualizzazione nel Calendario (Evento)
**Posizione:** `src/features/booking/utils/bookingEventTransform.ts`
**Funzione:** `transformBookingToCalendarEvent(booking)`

**Input dal DB:**
```typescript
booking.confirmed_start = "2025-01-15T20:00:00+00:00"
booking.confirmed_end = "2025-01-15T23:00:00+00:00"
```

**Processo:**
1. Estrae direttamente dalla stringa ISO con regex: `/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/`
2. Crea Date object con valori estratti: `new Date(2025, 0, 15, 20, 0, 0)`

**Verifica:**
- ✅ `startDate.getHours()` deve essere `20`
- ✅ `startDate.getMinutes()` deve essere `0`
- ✅ `endDate.getHours()` deve essere `23`
- ✅ `endDate.getMinutes()` deve essere `0`

**Posizione visualizzazione:** `src/features/booking/components/BookingCalendar.tsx`
- Evento nel calendario mostra l'ora usando `formatTime(booking.confirmed_start)`
- **Verifica:** Deve mostrare `20:00` (non `21:00` o altro)

### Fase 5: Collapse Card Fascia Oraria (Calendario)
**Posizione:** `src/features/booking/components/BookingCalendar.tsx` (righe 372-378, 518-524, 662-668)

**Utilizzo:**
```tsx
{extractTimeFromISO(booking.confirmed_start)} - {extractTimeFromISO(booking.confirmed_end)}
```

**Verifica:**
- ✅ Mattina card: Se booking è 20:00, non deve apparire (fuori range)
- ✅ Sera card: Se booking è 20:00, deve mostrare `20:00 - 23:00`

### Fase 6: Pannello Laterale (Click su Evento Calendario)
**Posizione:** `src/features/booking/components/BookingDetailsModal.tsx`

**Processo:**
1. Apre modal quando si clicca evento nel calendario
2. Usa `extractDateFromISO` e `extractTimeFromISO` per popolare form:
```typescript
date: extractDateFromISO(booking.confirmed_start)  // "2025-01-15"
startTime: extractTimeFromISO(booking.confirmed_start)  // "20:00"
endTime: extractTimeFromISO(booking.confirmed_end)  // "23:00"
```

**Verifica:**
- ✅ Campo data deve mostrare `2025-01-15`
- ✅ Campo orario inizio deve mostrare `20:00`
- ✅ Campo orario fine deve mostrare `23:00`
- ✅ Nessuno shift di 1 ora

### Fase 7: Archivio (ArchiveTab)
**Posizione:** `src/features/booking/components/ArchiveTab.tsx`

**Processo:**
- Usa `confirmed_start` se presente, altrimenti `desired_date`
- Per orario: usa `formatTime(displayTime)` dove `displayTime = booking.desired_time`

**Verifica:**
- ✅ Data mostrata deve essere `15 gennaio 2025` (da `confirmed_start`)
- ⚠️ **POSSIBILE PROBLEMA:** ArchiveTab mostra `desired_time` invece di estrarre da `confirmed_start`
- **Fix necessario:** Dovrebbe usare `extractTimeFromISO(booking.confirmed_start)` se presente

### Fase 8: Modifica Prenotazione (BookingDetailsModal)
**Posizione:** `src/features/booking/components/BookingDetailsModal.tsx`

**Processo:**
1. Mostra dati esistenti usando `extractDateFromISO` e `extractTimeFromISO`
2. Utente modifica
3. Salva usando `createBookingDateTime` con nuovi valori
4. Aggiorna nel DB

**Verifica:**
- ✅ Se modifichi orario da `20:00` a `21:00`, deve salvare come `21:00` (non `22:00`)
- ✅ Rilettura dopo modifica deve mostrare `21:00`

## Funzioni Critiche da Verificare

### 1. `createBookingDateTime(date, time, isStart, startTime)`
**File:** `src/features/booking/utils/dateUtils.ts`
**Verifica:**
- ✅ Input: `"2025-01-15"`, `"20:00"` → Output: `"2025-01-15T20:00:00+00:00"`
- ✅ Estrazione: `extractTimeFromISO(output)` → `"20:00"`

### 2. `extractDateFromISO(isoString)`
**File:** `src/features/booking/utils/dateUtils.ts`
**Verifica:**
- ✅ Input: `"2025-01-15T20:00:00+00:00"` → Output: `"2025-01-15"`
- ✅ NON usa `new Date()` per evitare conversioni timezone

### 3. `extractTimeFromISO(isoString)`
**File:** `src/features/booking/utils/dateUtils.ts`
**Verifica:**
- ✅ Input: `"2025-01-15T20:00:00+00:00"` → Output: `"20:00"`
- ✅ NON usa `new Date()` per evitare conversioni timezone

### 4. `transformBookingToCalendarEvent(booking)`
**File:** `src/features/booking/utils/bookingEventTransform.ts`
**Verifica:**
- ✅ Estrae direttamente dalla stringa ISO con regex
- ✅ Crea Date object con valori estratti (non da parsing ISO)
- ✅ `new Date(2025, 0, 15, 20, 0, 0)` → Hours = 20

## Test Manuali da Eseguire

### Test 1: Inserimento e Visualizzazione Base
1. ✅ Apri applicazione
2. ✅ Vai a "Prenotazioni" → "Pending"
3. ✅ Accetta una prenotazione con:
   - Data: `2025-01-15`
   - Inizio: `20:00`
   - Fine: `23:00`
4. ✅ Verifica che nel calendario l'evento mostri `20:00 - 23:00`
5. ✅ Clicca sull'evento → Verifica modal mostra `20:00 - 23:00`
6. ✅ Verifica collapse card "Sera" mostra `20:00 - 23:00`

### Test 2: Attraversamento Mezzanotte
1. ✅ Accetta prenotazione:
   - Data: `2025-01-15`
   - Inizio: `22:00`
   - Fine: `02:00`
2. ✅ Verifica che `confirmed_end` sia `2025-01-16T02:00:00+00:00`
3. ✅ Verifica visualizzazione mostra correttamente giorno successivo

### Test 3: Modifica Prenotazione
1. ✅ Apri prenotazione esistente (20:00)
2. ✅ Modifica orario a `21:00`
3. ✅ Salva
4. ✅ Verifica che visualizzazione mostri `21:00` (non `22:00`)

### Test 4: Archivio
1. ✅ Vai ad "Archivio"
2. ✅ Trova prenotazione accettata
3. ✅ Verifica che data e orario siano corretti
4. ⚠️ **PROBLEMA POTENZIALE:** Verifica se mostra `desired_time` invece di orario da `confirmed_start`

## Checklist Verifica Finale

- [ ] `createBookingDateTime` preserva orario esatto
- [ ] `extractDateFromISO` estrae data senza conversioni
- [ ] `extractTimeFromISO` estrae orario senza conversioni
- [ ] Calendario mostra orario corretto nell'evento
- [ ] Collapse card mostra orario corretto
- [ ] Pannello laterale mostra orario corretto
- [ ] Archivio mostra orario corretto (se usa confirmed_start)
- [ ] Modifica preserva nuovo orario esatto
- [ ] Attraversamento mezzanotte funziona correttamente

## Problemi Trovati da Risolvere

### Problema 1: ArchiveTab mostra desired_time invece di confirmed_start time
**Posizione:** `src/features/booking/components/ArchiveTab.tsx` (riga 48)
**Codice attuale:**
```typescript
const displayTime = booking.desired_time || 'Non specificato'
```

**Fix necessario:**
```typescript
const displayTime = booking.confirmed_start 
  ? extractTimeFromISO(booking.confirmed_start) 
  : booking.desired_time || 'Non specificato'
```

