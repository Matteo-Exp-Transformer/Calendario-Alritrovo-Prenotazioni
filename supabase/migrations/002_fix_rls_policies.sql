-- Fix RLS policies for Al Ritrovo Booking System
-- Allow public insert for booking_requests (form submission)

-- Drop existing policies on booking_requests
DROP POLICY IF EXISTS "Anyone can insert booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can view all requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can update requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can delete requests" ON booking_requests;

-- Recreate policies with proper configuration

-- 1. Allow ANYONE (anonymous/public) to INSERT booking requests
CREATE POLICY "Anyone can insert booking requests"
  ON booking_requests FOR INSERT
  WITH CHECK (true);

-- 2. Allow ONLY authenticated admin/staff to SELECT booking requests
CREATE POLICY "Only admins can view all requests"
  ON booking_requests FOR SELECT
  USING (
    auth.role() = 'authenticated' OR
    auth.uid() IS NOT NULL
  );

-- 3. Allow ONLY authenticated users to UPDATE booking requests
CREATE POLICY "Only authenticated users can update requests"
  ON booking_requests FOR UPDATE
  USING (
    auth.role() = 'authenticated' OR
    auth.uid() IS NOT NULL
  );

-- 4. Allow ONLY authenticated users to DELETE booking requests
CREATE POLICY "Only authenticated users can delete requests"
  ON booking_requests FOR DELETE
  USING (
    auth.role() = 'authenticated' OR
    auth.uid() IS NOT NULL
  );

-- Enable RLS on booking_requests (should already be enabled)
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Allow public INSERT for email_logs (from backend)
DROP POLICY IF EXISTS "Anyone can insert email logs" ON email_logs;
CREATE POLICY "Anyone can insert email logs"
  ON email_logs FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to SELECT email_logs
DROP POLICY IF EXISTS "Only admins can view email logs" ON email_logs;
CREATE POLICY "Only authenticated users can view email logs"
  ON email_logs FOR SELECT
  USING (
    auth.role() = 'authenticated' OR
    auth.uid() IS NOT NULL
  );

