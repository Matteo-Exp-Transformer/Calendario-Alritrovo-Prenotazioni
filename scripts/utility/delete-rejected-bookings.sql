-- =====================================================
-- QUERY PER CANCELLARE PRENOTAZIONI RIFIUTATE
-- =====================================================

-- 1. VISUALIZZA PRIMA LE PRENOTAZIONI RIFIUTATE
-- (Esegui questa per vedere cosa verrà cancellato)
SELECT 
  id,
  client_name,
  client_email,
  event_type,
  desired_date,
  status,
  rejection_reason,
  created_at,
  updated_at
FROM booking_requests
WHERE status = 'rejected'
ORDER BY created_at DESC;

-- 2. CONTA QUANTE PRENOTAZIONI RIFIUTATE CI SONO
SELECT 
  COUNT(*) as totale_rifiutate,
  COUNT(CASE WHEN rejection_reason IS NOT NULL THEN 1 END) as con_motivo,
  COUNT(CASE WHEN rejection_reason IS NULL THEN 1 END) as senza_motivo
FROM booking_requests
WHERE status = 'rejected';

-- 3. CANCELLA TUTTE LE PRENOTAZIONI RIFIUTATE
-- ⚠️ ATTENZIONE: Questa operazione è IRREVERSIBILE!
-- Esegui prima le query 1 e 2 per verificare
DELETE FROM booking_requests
WHERE status = 'rejected';

-- 4. CANCELLA SOLO LE PRENOTAZIONI RIFIUTATE PRIMA DI UNA CERTA DATA
-- Esempio: cancella quelle rifiutate prima del 1 gennaio 2025
DELETE FROM booking_requests
WHERE status = 'rejected'
  AND updated_at < '2025-01-01 00:00:00';

-- 5. CANCELLA SOLO LE PRENOTAZIONI RIFIUTATE PIÙ VECCHIE DI X GIORNI
-- Esempio: cancella quelle rifiutate più di 30 giorni fa
DELETE FROM booking_requests
WHERE status = 'rejected'
  AND updated_at < NOW() - INTERVAL '30 days';

-- 6. BACKUP PRIMA DI CANCELLARE (opzionale, crea una tabella di backup)
CREATE TABLE booking_requests_rejected_backup AS
SELECT * FROM booking_requests
WHERE status = 'rejected';

-- 7. CANCELLA CON LIMITE (es. prime 10 più vecchie)
DELETE FROM booking_requests
WHERE id IN (
  SELECT id
  FROM booking_requests
  WHERE status = 'rejected'
  ORDER BY updated_at ASC
  LIMIT 10
);

-- 8. VERIFICA DOPO LA CANCELLAZIONE
SELECT 
  COUNT(*) as rimanenti_rifiutate
FROM booking_requests
WHERE status = 'rejected';


