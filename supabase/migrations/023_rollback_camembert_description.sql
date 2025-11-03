-- Migration: Rollback Camembert description
-- Created: 2025-01-XX
-- Description: Rolls back the description update of "Camembert" menu item to original value
-- Note: Pulled Pork description is kept with the update

-- Rollback Camembert description to original
UPDATE menu_items 
SET description = '2 pz a persona',
    updated_at = NOW()
WHERE name = 'Camembert' AND category = 'fritti';



