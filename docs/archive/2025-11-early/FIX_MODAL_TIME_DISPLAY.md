# Fix: Orario nel Modal Dettagli Prenotazione

## Problema
Quando si clicca su una prenotazione nel calendario, il modal dei dettagli (`BookingDetailsModal`) mostra l'orario con uno shift di 4-5 ore (es. 20:30 → 16:30).

## Causa Root
PostgreSQL/Supabase quando restituisce un campo `TIMESTAMP WITH TIME ZONE` lo converte nel timezone del client. Quindi:
- Salviamo: `2025-11-10T20:30:00+00:00`
- PostgreSQL lo salva come: `2025-11-10 20:30:00 UTC`
- Quando lo leggiamo, Supabase lo restituisce convertito nel timezone locale (es. `2025-11-10T16:30:00-04:00`)
- `extractTimeFromISO()` estrae "16:30" dalla stringa convertita

## Soluzione Applicata
Usare `desired_time` (campo TIME, non soggetto a conversioni timezone) come fonte primaria per la visualizzazione, con fallback a `extractTimeFromISO(confirmed_start)` se non disponibile.

### File Modificati

#### 1. `src/features/booking/components/BookingDetailsModal.tsx`

**Cambiamento 1: Visualizzazione Data e Ora (view mode)**
- ✅ Usa `desired_time` se disponibile (orario originale inserito dall'utente)
- ✅ Fallback a `extractTimeFromISO(confirmed_start)` se `desired_time` non disponibile

**Cambiamento 2: formData iniziale e useEffect**
- ✅ Usa `desired_time` per popolare `startTime` nel formData
- ✅ Calcola `endTime` da `desired_time + 3h` se disponibile

### Verifica
Il test E2E `06-complete-booking-flow.spec.ts` verifica:
1. Inserimento prenotazione con orario specifico
2. Accettazione prenotazione
3. Verifica orario nel modal dettagli

### Stato
✅ **FIX APPLICATO**: Il codice ora usa `desired_time` quando disponibile
⚠️ **PROBLEMA RESIDUO**: Se `desired_time` non è disponibile nel booking object, viene usato `extractTimeFromISO(confirmed_start)` che potrebbe estrarre l'orario convertito

### Prossimi Passi
1. Verificare che `desired_time` sia sempre presente nel booking object quando viene letto dal database
2. Verificare che la query `useAcceptedBookings` restituisca tutti i campi incluso `desired_time`
3. Se necessario, salvare l'orario originale in un campo separato durante l'accettazione

