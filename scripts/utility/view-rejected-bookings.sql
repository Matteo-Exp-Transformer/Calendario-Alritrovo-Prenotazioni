-- =====================================================
-- QUERY PER VISUALIZZARE PRENOTAZIONI RIFIUTATE
-- =====================================================

-- 1. Tutte le prenotazioni rifiutate con dettagli
SELECT 
  id,
  client_name,
  client_email,
  client_phone,
  event_type,
  desired_date,
  desired_time,
  num_guests,
  status,
  rejection_reason,
  created_at,
  updated_at
FROM booking_requests
WHERE status = 'rejected'
ORDER BY updated_at DESC;

-- 2. Statistiche prenotazioni rifiutate
SELECT 
  COUNT(*) as totale_rifiutate,
  COUNT(CASE WHEN rejection_reason IS NOT NULL THEN 1 END) as con_motivo,
  COUNT(CASE WHEN rejection_reason IS NULL THEN 1 END) as senza_motivo,
  MIN(updated_at) as prima_rifiutata,
  MAX(updated_at) as ultima_rifiutata
FROM booking_requests
WHERE status = 'rejected';

-- 3. Rifiutate per tipo evento
SELECT 
  event_type,
  COUNT(*) as quantita
FROM booking_requests
WHERE status = 'rejected'
GROUP BY event_type
ORDER BY quantita DESC;

-- 4. Rifiutate per mese
SELECT 
  DATE_TRUNC('month', updated_at) as mese,
  COUNT(*) as quantita
FROM booking_requests
WHERE status = 'rejected'
GROUP BY DATE_TRUNC('month', updated_at)
ORDER BY mese DESC;

-- 5. Rifiutate recenti (ultime 7 giorni)
SELECT 
  id,
  client_name,
  client_email,
  event_type,
  desired_date,
  rejection_reason,
  updated_at
FROM booking_requests
WHERE status = 'rejected'
  AND updated_at >= NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;

-- 6. Rifiutate più vecchie di X giorni
SELECT 
  id,
  client_name,
  client_email,
  event_type,
  desired_date,
  rejection_reason,
  updated_at,
  NOW() - updated_at as giorni_fa
FROM booking_requests
WHERE status = 'rejected'
  AND updated_at < NOW() - INTERVAL '30 days'
ORDER BY updated_at ASC;


