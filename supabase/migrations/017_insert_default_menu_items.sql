-- Migration: Insert Default Menu Items
-- Created: 2025-01-XX
-- Description: Inserts all default menu items with prices as specified

-- =====================================================
-- BEVANDE
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Caraffe / Drink', 'bevande', 6.50, '0,5 l x Persona (Vino - Birra - Spritz inclusi)', 2),
  ('Caraffe / Drink Premium', 'bevande', 8.00, '0,5l x persona / 1 drink per persona (Gin Tonic - Negroni - Moscow mule inclusi)', 3),
  ('Caffè', 'bevande', 1.00, NULL, 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ANTIPASTI
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Pizza Margherita', 'antipasti', 4.50, '2 tranci a persona', 1),
  ('Pizza rossa', 'antipasti', 4.00, '2 tranci a persona', 2),
  ('Focaccia Rosmarino', 'antipasti', 4.00, '2 tranci a persona', 3),
  ('Farinata', 'antipasti', 1.50, '3 pz. a persona', 4),
  ('Salumi con piadina', 'antipasti', 6.00, '3 tipi salumi 2 fette a persona + piadina', 5),
  ('Caprese', 'antipasti', 4.00, '1 pomodoro 1 mozzarella', 6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FRITTI
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Olive Ascolana', 'fritti', 1.50, '2 pz a persona', 1),
  ('Anelli di Cipolla', 'fritti', 1.50, '2 pz a persona', 2),
  ('Patatine fritte', 'fritti', 1.50, NULL, 3),
  ('Camembert', 'fritti', 2.00, '2 pz a persona', 4),
  ('Nachos con cheddar', 'fritti', 2.00, '2 pz a persona', 5),
  ('Jalapeños con formaggio', 'fritti', 2.00, '2 pz a persona', 6),
  ('Pulled Pork', 'fritti', 2.50, 'Bite panati di Pulled Pork 2 pz a persona', 7),
  ('Panelle (Farina di Ceci fritta, Specialità Siciliana)', 'fritti', 2.00, '2 pz a persona', 8),
  ('Falafel', 'fritti', 2.00, '2 pz a persona', 9),
  ('Polpette vegane di Lenticchie', 'fritti', 3.00, '2 pz a persona', 10),
  ('Verdure Pastellate', 'fritti', 2.00, NULL, 11)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRIMI PIATTI
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Lasagne Ragù', 'primi', 8.00, NULL, 1),
  ('Cannelloni Ricotta e Spinaci', 'primi', 7.00, NULL, 2),
  ('Gramigna Panna e Salsiccia', 'primi', 8.00, NULL, 3),
  ('Rigatoni Al Ragù', 'primi', 8.00, NULL, 4)
ON CONFLICT DO NOTHING;

-- Opzione speciale "Bis di Primi" (da selezionare come checkbox separata)
-- Non viene inserita qui perché è un'opzione speciale, non un prodotto

-- =====================================================
-- SECONDI PIATTI
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Polpette di carne', 'secondi', 6.00, '4 pz a persona', 1),
  ('Polpette di melanzane', 'secondi', 6.00, '4 pz a persona', 2),
  ('Polpette Patate e Mortadella', 'secondi', 6.00, '4 pz a persona', 3),
  ('Polpette Salsiccia e friarielli', 'secondi', 6.00, '4 pz a persona', 4),
  ('Polpette Vegane di Lenticchie e Curry', 'secondi', 6.00, '4 pz a persona', 5),
  ('Cotoletta Vegana', 'secondi', 7.00, '1 pz a persona', 6)
ON CONFLICT DO NOTHING;




