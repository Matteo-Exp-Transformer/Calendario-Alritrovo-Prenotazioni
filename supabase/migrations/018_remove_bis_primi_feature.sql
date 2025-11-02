-- Migration: Remove Bis di Primi Feature
-- Created: 2025-11-01
-- Description: Removes is_bis_option column from menu_items table.
--              Historical bookings retain bis_primi in JSONB for archival accuracy.

-- =====================================================
-- 1. Remove column from menu_items table
-- =====================================================

-- Drop the is_bis_option column (added in migration 016)
ALTER TABLE menu_items
  DROP COLUMN IF EXISTS is_bis_option;

-- =====================================================
-- 2. Historical data handling
-- =====================================================

-- Note: We intentionally KEEP bis_primi in historical bookings for archival purposes.
-- This preserves the accuracy of past orders and maintains data integrity.
--
-- New bookings created after this migration will not include the bis_primi field.
-- UI components will ignore bis_primi if present in old bookings.
--
-- If you need to remove bis_primi from ALL existing bookings (not recommended):
-- Uncomment the following SQL statement:
--
-- UPDATE booking_requests
-- SET menu_selection = menu_selection - 'bis_primi'
-- WHERE menu_selection IS NOT NULL
--   AND menu_selection ? 'bis_primi';

-- =====================================================
-- 3. Migration complete
-- =====================================================

-- No indexes to drop (is_bis_option was not indexed)
-- No RLS policies to modify (column removal doesn't affect existing policies)
