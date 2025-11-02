-- Migration: Remove duplicate menu items
-- Created: 2025-11-02
-- Description: Removes duplicate menu items, keeping only the most recent record for each (name, category) combination
-- Root Cause: Migration 017 was executed 4 times without proper unique constraint, creating 4x duplicates

-- Remove duplicates keeping the most recent record for each (name, category)
-- Uses DISTINCT ON to select one row per (name, category) based on most recent created_at
DELETE FROM menu_items
WHERE id NOT IN (
  SELECT DISTINCT ON (name, category) id
  FROM menu_items
  ORDER BY name, category, created_at DESC
);

-- Verify: Should have exactly 31 menu items remaining (original count)
-- SELECT COUNT(*) FROM menu_items;
