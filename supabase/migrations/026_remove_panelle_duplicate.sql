-- Migration: Remove duplicate Panelle menu item
-- Created: 2025-11-02
-- Description: Removes the "Panelle" item without parentheses, keeping only the full name version
-- Root Cause: Manual creation or old migration version created two Panelle items with different names

-- Remove the "Panelle" entry without full description in name
-- Keep only "Panelle (Farina di Ceci fritta, Specialità Siciliana)"
DELETE FROM menu_items
WHERE name = 'Panelle'
  AND category = 'fritti'
  AND description LIKE '% Farina di Ceci fritta, Specialità Siciliana %';

-- Verify: Should have only one Panelle item remaining
-- SELECT * FROM menu_items WHERE name LIKE 'Panelle%' AND category = 'fritti';
