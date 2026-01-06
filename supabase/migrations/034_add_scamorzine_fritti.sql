-- Migration: Add Scamorzine to Fritti category
-- Created: 2025-12-04
-- Description: Adds "Scamorzine" ingredient to fritti category at 2€

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Scamorzine', 'fritti', 2.00, NULL, 12)
ON CONFLICT DO NOTHING;
