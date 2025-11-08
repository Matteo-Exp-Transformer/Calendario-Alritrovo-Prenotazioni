-- =====================================================
-- UPDATE PREZZI MENU ITEMS
-- =====================================================
-- Aggiorna i prezzi di Anelli di Cipolla e Olive Ascolana da 1.00 a 1.50 EUR
-- Data: 2025-01-XX
-- =====================================================

-- Aggiorna il prezzo di Anelli di Cipolla
UPDATE menu_items 
SET 
  price = 1.50,
  updated_at = NOW()
WHERE name = 'Anelli di Cipolla';

-- Aggiorna il prezzo di Olive Ascolana
UPDATE menu_items 
SET 
  price = 1.50,
  updated_at = NOW()
WHERE name = 'Olive Ascolana';

-- Verifica le modifiche
SELECT 
  name, 
  category, 
  price, 
  description, 
  updated_at 
FROM menu_items 
WHERE name IN ('Anelli di Cipolla', 'Olive Ascolana')
ORDER BY name;

-- =====================================================
-- CONTO DELLE RIGHE AGGIORNATE
-- =====================================================
-- Dovresti vedere 2 righe aggiornate (una per Anelli di Cipolla, una per Olive Ascolana)










