-- Migration: Update Caraffe Drink Premium Description
-- Created: 2025-01-XX
-- Description: Reduces description text for Caraffe / Drink Premium to make it more concise

-- =====================================================
-- AGGIORNA DESCRIZIONE CARAFFE / DRINK PREMIUM
-- =====================================================
UPDATE menu_items 
SET 
  description = '0,5l x persona / 1 drink (Gin Tonic, Negroni, Moscow mule inclusi)',
  updated_at = NOW()
WHERE name = 'Caraffe / Drink Premium';

-- =====================================================
-- VERIFICA MODIFICA
-- =====================================================
-- Verifica che la descrizione sia stata aggiornata correttamente
SELECT 
  name, 
  category, 
  price, 
  description, 
  updated_at 
FROM menu_items 
WHERE name = 'Caraffe / Drink Premium';










