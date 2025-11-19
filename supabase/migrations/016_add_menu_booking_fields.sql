-- Migration: Add Menu Booking System Fields
-- Created: 2025-01-XX
-- Description: Adds fields for menu selection and dietary restrictions to booking_requests
--              Creates menu_items table for product management

-- =====================================================
-- 1. Aggiungi colonne a booking_requests
-- =====================================================

-- Tipologia di prenotazione
ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) CHECK (booking_type IN ('tavolo', 'rinfresco_laurea'));

-- Menu selection (JSONB per flessibilità)
ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS menu_selection JSONB;

-- Prezzi menu
ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS menu_total_per_person NUMERIC(10, 2);

ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS menu_total_booking NUMERIC(10, 2);

-- Intolleranze alimentari
ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB;

-- Rendere event_type nullable (per retrocompatibilità durante transizione)
ALTER TABLE booking_requests 
  ALTER COLUMN event_type DROP NOT NULL;

-- =====================================================
-- 2. Crea tabella menu_items
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dettagli prodotto
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('bevande', 'antipasti', 'fritti', 'primi', 'secondi')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  
  -- Opzione speciale "Bis di Primi"
  is_bis_option BOOLEAN DEFAULT FALSE,
  
  -- Ordinamento (per mantenere ordine all'interno della categoria)
  sort_order INTEGER DEFAULT 0
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(category, sort_order);

-- =====================================================
-- 3. RLS Policies per menu_items
-- =====================================================

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Chiunque può leggere i menu items (per il form pubblico)
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  USING (true);

-- Solo admin possono modificare menu items
CREATE POLICY "Only admins can manage menu items"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.role IN ('admin', 'staff')
    )
  );

















