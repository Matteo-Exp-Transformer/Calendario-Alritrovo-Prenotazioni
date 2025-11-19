-- Migration: Update Onion Rings and Olive Prices
-- Created: 2025-01-XX
-- Description: Updates prices for Anelli di Cipolla and Olive Ascolana from 1.00 to 1.50 EUR

-- =====================================================
-- AGGIORNA PREZZO ANELLI DI CIPOLLA
-- =====================================================
UPDATE menu_items 
SET 
  price = 1.50,
  updated_at = NOW()
WHERE name = 'Anelli di Cipolla';

-- =====================================================
-- AGGIORNA PREZZO OLIVE ASCOLANA
-- =====================================================
UPDATE menu_items 
SET 
  price = 1.50,
  updated_at = NOW()
WHERE name = 'Olive Ascolana';

-- =====================================================
-- VERIFICA MODIFICHE
-- =====================================================
-- Verifica che i prezzi siano stati aggiornati correttamente
-- Dovresti vedere 2 righe con prezzo = 1.50
SELECT 
  name, 
  category, 
  price, 
  description, 
  updated_at 
FROM menu_items 
WHERE name IN ('Anelli di Cipolla', 'Olive Ascolana')
ORDER BY name;











