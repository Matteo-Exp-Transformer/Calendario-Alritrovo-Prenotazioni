# Istruzioni per Testare la Migration booking_source

## 1. Eseguire la Migration

Vai su Supabase Dashboard → SQL Editor e esegui il file:
```
supabase/migrations/035_add_booking_source.sql
```

Oppure copia e incolla questo SQL:

```sql
-- Migration: Aggiungere campo booking_source
ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS booking_source VARCHAR(50) DEFAULT 'public' NOT NULL;

-- Aggiungere CHECK constraint
ALTER TABLE booking_requests
DROP CONSTRAINT IF EXISTS booking_requests_booking_source_check;

ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_booking_source_check
CHECK (booking_source IN ('public', 'admin'));

-- Commento
COMMENT ON COLUMN booking_requests.booking_source IS 
  'Origine della prenotazione: public (pagina /prenota) o admin (pagina Admin - Inserisci nuova prenotazione)';
```

## 2. Verificare che la Migration sia Andata a Buon Fine

Esegui questa query per verificare:

```sql
-- Controlla che la colonna esista
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'booking_requests' AND column_name = 'booking_source';

-- Verifica che tutte le prenotazioni esistenti abbiano booking_source = 'public'
SELECT id, client_name, booking_source, created_at
FROM booking_requests
ORDER BY created_at DESC
LIMIT 10;
```

## 3. Risultati Attesi

1. La colonna `booking_source` deve esistere con:
   - Tipo: `character varying (VARCHAR(50))`
   - Default: `'public'::character varying`
   - NOT NULL: `NO` (perché ha un default)

2. Tutte le prenotazioni esistenti devono avere `booking_source = 'public'`

## 4. Test delle Nuove Prenotazioni

### Test Prenotazione da Pagina Pubblica
1. Vai su `/prenota`
2. Compila il form e invia
3. Verifica che la prenotazione creata abbia `booking_source = 'public'`

### Test Prenotazione da Admin
1. Fai login come admin
2. Vai su "Inserisci nuova prenotazione"
3. Compila il form e crea la prenotazione
4. Verifica che la prenotazione creata abbia `booking_source = 'admin'`

### Query di Verifica
```sql
-- Conta le prenotazioni per origine
SELECT booking_source, COUNT(*) as total
FROM booking_requests
GROUP BY booking_source;

-- Mostra le ultime 5 prenotazioni con la loro origine
SELECT 
  id, 
  client_name, 
  booking_source,
  status,
  created_at
FROM booking_requests
ORDER BY created_at DESC
LIMIT 5;
```

## 5. Verifica nel Calendario

Dopo aver eseguito la migration e creato alcune prenotazioni:

1. Vai sul calendario admin
2. Verifica che le prenotazioni abbiano le icone corrette:
   - 📞 per prenotazioni da pagina "Prenota" (public)
   - 👤 per prenotazioni create dall'admin

3. Clicca su una prenotazione per aprire i dettagli
4. Verifica che nell'header ci sia il badge:
   - Badge blu "📞 Prenota" per public
   - Badge verde "👤 Admin" per admin

## Implementazione Completata ✅

Tutti i file sono stati modificati correttamente:
- ✅ Migration SQL creata
- ✅ TypeScript types aggiornati
- ✅ Hook useCreateBookingRequest modificato (public)
- ✅ Hook useCreateAdminBooking modificato (admin)
- ✅ Calendario con icone
- ✅ Modal dettagli con badge

**L'unica azione richiesta è eseguire la migration SQL sul database Supabase.**
