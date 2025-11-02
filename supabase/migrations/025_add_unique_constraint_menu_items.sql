-- Migration: Add unique constraint on menu_items (name, category)
-- Created: 2025-11-02
-- Description: Adds UNIQUE constraint to prevent duplicate menu items with same name and category
-- This makes ON CONFLICT DO NOTHING work correctly in future migrations

-- Add unique constraint on (name, category)
-- This ensures no two menu items can have the same name in the same category
ALTER TABLE menu_items
ADD CONSTRAINT menu_items_name_category_unique UNIQUE (name, category);

-- Verify: This constraint will now make ON CONFLICT DO NOTHING work correctly
-- Future INSERT statements with duplicate (name, category) will be ignored
