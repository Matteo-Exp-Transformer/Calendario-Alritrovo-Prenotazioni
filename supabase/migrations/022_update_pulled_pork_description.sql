-- Migration: Update Pulled Pork description
-- Created: 2025-01-XX
-- Description: Updates the description of "Pulled Pork" menu item in fritti category

-- Update Pulled Pork description
UPDATE menu_items 
SET description = 'Bite panati di Pulled Pork 2 pz a persona',
    updated_at = NOW()
WHERE name = 'Pulled Pork' AND category = 'fritti';

