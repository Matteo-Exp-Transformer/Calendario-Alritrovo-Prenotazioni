-- =====================================================
-- Query per cancellare tutte le prenotazioni dal sistema
-- =====================================================
-- ATTENZIONE: Questa query cancella TUTTE le prenotazioni
-- I log email associati verranno cancellati automaticamente
-- grazie alla foreign key con ON DELETE CASCADE
-- =====================================================

-- Verifica quante prenotazioni ci sono prima della cancellazione
SELECT COUNT(*) as prenotazioni_prima FROM booking_requests;

-- Cancella tutte le prenotazioni
DELETE FROM booking_requests;

-- Verifica che siano state cancellate
SELECT COUNT(*) as prenotazioni_dopo FROM booking_requests;

-- Verifica che anche i log email siano stati cancellati
SELECT COUNT(*) as log_email_rimasti FROM email_logs;

