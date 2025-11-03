-- Migration: Remove "Acqua" menu item
-- Created: 2025-01-XX
-- Description: Removes "Acqua" from menu_items table

DELETE FROM menu_items 
WHERE name = 'Acqua' AND category = 'bevande';





