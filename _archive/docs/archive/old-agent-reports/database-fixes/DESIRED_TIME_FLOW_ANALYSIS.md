# Analisi Flusso desired_time

## Problema Segnalato
Incongruenza tra orario inserito dall'utente e orario registrato nel database.

## Flusso Completo

### 1. INPUT UTENTE (BookingRequestForm.tsx - riga 362-374)
```typescript
<Input
  id="desired_time"
  type="time"                    // HTML5 time input
  value={formData.desired_time || ''}
  onChange={(e) => {
    setFormData({ ...formData, desired_time: e.target.value })
  }}
/>
```

**Formato prodotto**: `HH:MM` (es: "20:30")
- Input HTML5 type="time" restituisce sempre formato 24h: `HH:MM`
- Nessuna conversione o manipolazione

### 2. VALIDAZIONE (BookingRequestForm.tsx - riga 115-118)
```typescript
if (!formData.desired_time) {
  newErrors.desired_time = 'Orario obbligatorio'
  isValid = false
}
```
- Solo controllo presenza, nessuna validazione formato

### 3. SALVATAGGIO NEL DATABASE (useBookingRequests.ts - riga 15-25)
```typescript
// Normalizza desired_time a formato HH:MM (rimuove secondi se presenti)
const normalizedTime = data.desired_time 
  ? data.desired_time.split(':').slice(0, 2).join(':')
  : null

const insertData: any = {
  // ...
  desired_time: normalizedTime,
  // ...
}

const { data: result, error } = await supabasePublic
  .from('booking_requests')
  .insert(insertData)
```

**Formato salvato**: Stringa `HH:MM` normalizzata o `null`
- ✅ **FIX APPLICATO**: Normalizzazione a formato `HH:MM` prima del salvataggio
- Rimuove eventuali secondi o microsecondi
- Garantisce formato coerente nel database

### 4. DATABASE SCHEMA (001_initial_schema.sql - riga 21)
```sql
desired_time TIME,
```

**Tipo PostgreSQL**: `TIME` (senza timezone)
- Accetta formato `HH:MM:SS` o `HH:MM`
- Quando salvi `"20:30"`, PostgreSQL lo accetta
- Potrebbe restituirlo come `"20:30:00"` quando viene letto

### 5. LETTURA DAL DATABASE
PostgreSQL può restituire TIME in diversi formati:
- `HH:MM:SS` (es: "20:30:00")
- `HH:MM:SS.ssssss` (es: "20:30:00.000000")

### 6. VISUALIZZAZIONE (BookingRequestCard.tsx - riga 44-47)
```typescript
const formatTime = (timeStr?: string) => {
  if (!timeStr) return 'Non specificato'
  // Rimuovi i secondi se presenti (formato HH:MM:SS -> HH:MM)
  return timeStr.split(':').slice(0, 2).join(':')
}
```

**Formato visualizzato**: `HH:MM`
- Rimuove i secondi se presenti
- Dovrebbe essere coerente

## Possibili Problemi

### Problema 1: Formato Restituito da PostgreSQL
- **Inserimento**: `"20:30"` (HH:MM)
- **Lettura**: `"20:30:00"` o `"20:30:00.000000"` (HH:MM:SS con microsecondi)
- **Impatto**: La visualizzazione gestisce questo caso con `formatTime()`

### Problema 2: Timezone (IMPOSSIBILE)
- `desired_time` è di tipo `TIME` (senza timezone)
- Non dovrebbe esserci problema di timezone
- `created_at` è `TIMESTAMP WITH TIME ZONE`, ma è un campo separato

### Problema 3: Conversione Automatica Supabase
- Supabase potrebbe convertire `TIME` in formato diverso
- Potrebbe aggiungere secondi automaticamente

## Verifica Necessaria

1. **Verificare formato nel DB**:
   ```sql
   SELECT 
     id, 
     desired_time, 
     desired_time::text as time_as_text,
     created_at,
     updated_at
   FROM booking_requests 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

2. **Verificare formato durante insert**:
   - Aggiungere log in `useBookingRequests.ts` per vedere esattamente cosa viene inviato
   - Aggiungere log per vedere cosa viene restituito dopo l'insert

3. **Verificare formato durante lettura**:
   - Controllare cosa restituisce Supabase quando legge `desired_time`

## Fix Applicato ✅

1. **Normalizzazione formato a HH:MM in useBookingRequests.ts**:
   - ✅ Normalizza `desired_time` prima di salvare
   - ✅ Rimuove secondi e microsecondi se presenti
   - ✅ Applicato anche in `useAdminBookingRequests.ts`

2. **Formato garantito**:
   - Input utente: `HH:MM` (es: "20:30")
   - Salvataggio DB: `HH:MM` (normalizzato)
   - Lettura DB: gestito da `formatTime()` che rimuove secondi
   - Visualizzazione: sempre `HH:MM`

## Risultato

✅ **Formato unico garantito**: `HH:MM` in tutto il flusso
- Input → Normalizzazione → Database → Visualizzazione

## Test Raccomandati

1. Test inserimento con formato `HH:MM`
2. Test inserimento con formato `HH:MM:SS` (dovrebbe essere normalizzato)
3. Verifica lettura dal database che restituisce formato coerente

