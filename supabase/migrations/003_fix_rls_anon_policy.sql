-- Fix RLS policy to allow anonymous inserts
-- This allows public users (clients) to submit booking requests

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous insert for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated select for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated update for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated delete for booking requests" ON booking_requests;

-- Recreate policies with proper configuration

-- 1. Allow anonymous users (anon role) to INSERT booking requests
-- This enables the public booking form
CREATE POLICY "Allow anonymous insert for booking requests"
ON booking_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow authenticated users (admins) to SELECT all booking requests
CREATE POLICY "Allow authenticated select for booking requests"
ON booking_requests
FOR SELECT
TO authenticated
USING (true);

-- 3. Allow authenticated users (admins) to UPDATE booking requests
CREATE POLICY "Allow authenticated update for booking requests"
ON booking_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow authenticated users (admins) to DELETE booking requests
CREATE POLICY "Allow authenticated delete for booking requests"
ON booking_requests
FOR DELETE
TO authenticated
USING (true);

-- Enable RLS on booking_requests
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Verify policies are created
SELECT 
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'booking_requests'
ORDER BY cmd;

