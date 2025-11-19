-- Migration: Remove "Acqua" menu item with policy update
-- Created: 2025-01-XX
-- Description: Allows anonymous DELETE for menu_items to remove Acqua, then removes it

-- Temporaneamente permettere DELETE anonimo per menu_items (solo per questa operazione)
CREATE POLICY "anon_can_delete_acqua_menu_items"
  ON menu_items FOR DELETE
  TO anon
  USING (name = 'Acqua' AND category = 'bevande');

-- Rimuovi "Acqua"
DELETE FROM menu_items 
WHERE name = 'Acqua' AND category = 'bevande';

-- Rimuovi la policy temporanea dopo la rimozione
DROP POLICY IF EXISTS "anon_can_delete_acqua_menu_items" ON menu_items;














