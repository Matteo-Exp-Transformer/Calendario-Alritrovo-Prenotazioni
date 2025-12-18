-- Migration: Aggiungere campo booking_source per tracciare l'origine delle prenotazioni
-- Created: 2025-01-27
-- Description: Aggiunge colonna booking_source per distinguere prenotazioni create da pagina pubblica vs admin
--              Valori: 'public' (pagina Prenota) o 'admin' (pagina Admin - Inserisci nuova prenotazione)

-- Aggiungere colonna booking_source
ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS booking_source VARCHAR(50) DEFAULT 'public' NOT NULL;

-- Aggiungere CHECK constraint per garantire solo valori validi
ALTER TABLE booking_requests
DROP CONSTRAINT IF EXISTS booking_requests_booking_source_check;

ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_booking_source_check
CHECK (booking_source IN ('public', 'admin'));

-- Commento per documentazione
COMMENT ON COLUMN booking_requests.booking_source IS 
  'Origine della prenotazione: public (pagina /prenota) o admin (pagina Admin - Inserisci nuova prenotazione)';

-- Le prenotazioni esistenti avranno automaticamente booking_source='public' grazie al DEFAULT
-- Questo è corretto perché storicamente tutte le prenotazioni provenivano dalla pagina pubblica
