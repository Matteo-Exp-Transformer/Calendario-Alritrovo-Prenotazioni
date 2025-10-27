-- Al Ritrovo Booking System - Initial Schema
-- Created: 2025-10-27
-- Description: Creates 4 main tables with RLS policies

-- =====================================================
-- 1. TABELLA booking_requests
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Informazioni cliente
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),

  -- Dettagli prenotazione
  event_type VARCHAR(100) NOT NULL,
  desired_date DATE NOT NULL,
  desired_time TIME,
  num_guests INTEGER,
  special_requests TEXT,

  -- Status management
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  confirmed_start TIMESTAMP WITH TIME ZONE,
  confirmed_end TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Cancellation tracking
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID
);

-- =====================================================
-- 2. TABELLA admin_users
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELLA email_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES booking_requests(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  provider_response JSONB,
  error_message TEXT
);

-- =====================================================
-- 4. TABELLA restaurant_settings
-- =====================================================
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. INSERT SETTINGS INIZIALI
-- =====================================================
INSERT INTO restaurant_settings (setting_key, setting_value) VALUES
  ('email_notifications_enabled', '{"value": true}'),
  ('sender_email', '{"value": "noreply@resend.dev"}'),
  ('restaurant_name', '{"value": "Al Ritrovo"}'),
  ('restaurant_address', '{"value": "Bologna, Italia"}')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 6. INDICI PER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_date ON booking_requests(desired_date);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created ON booking_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_booking ON email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);

-- =====================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on booking_requests
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can insert booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can view all requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can update requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can delete requests" ON booking_requests;
DROP POLICY IF EXISTS "anon_can_insert_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_select_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_update_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_delete_booking_requests" ON booking_requests;

-- Policy 1: Allow anonymous users to insert (public form)
CREATE POLICY "anon_can_insert_booking_requests"
  ON booking_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Only authenticated admins can view all requests
CREATE POLICY "authenticated_can_select_booking_requests"
  ON booking_requests FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Only authenticated admins can update requests
CREATE POLICY "authenticated_can_update_booking_requests"
  ON booking_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Only authenticated admins can delete requests
CREATE POLICY "authenticated_can_delete_booking_requests"
  ON booking_requests FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Only admins can manage admin users" ON admin_users;

-- Policy: Solo admin possono vedere/modificare admin_users
CREATE POLICY "authenticated_can_manage_admin_users"
  ON admin_users FOR ALL
  TO authenticated
  USING (true);

-- Enable RLS on email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Only admins can view email logs" ON email_logs;
DROP POLICY IF EXISTS "authenticated_can_select_email_logs" ON email_logs;

-- Policy: Solo admin possono vedere email logs
CREATE POLICY "authenticated_can_select_email_logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

-- Enable RLS on restaurant_settings
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admins can manage settings" ON restaurant_settings;
DROP POLICY IF EXISTS "anon_can_select_restaurant_settings" ON restaurant_settings;
DROP POLICY IF EXISTS "authenticated_can_select_restaurant_settings" ON restaurant_settings;
DROP POLICY IF EXISTS "authenticated_can_update_restaurant_settings" ON restaurant_settings;

-- Policy: Allow anonymous to read settings (for public display)
CREATE POLICY "anon_can_select_restaurant_settings"
  ON restaurant_settings FOR SELECT
  TO anon
  USING (true);

-- Policy: Authenticated users can select settings
CREATE POLICY "authenticated_can_select_restaurant_settings"
  ON restaurant_settings FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update settings
CREATE POLICY "authenticated_can_update_restaurant_settings"
  ON restaurant_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 8. TRIGGER PER updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_booking_requests_updated_at ON booking_requests;
CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurant_settings_updated_at ON restaurant_settings;
CREATE TRIGGER update_restaurant_settings_updated_at
  BEFORE UPDATE ON restaurant_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCHEMA COMPLETATO
-- =====================================================
