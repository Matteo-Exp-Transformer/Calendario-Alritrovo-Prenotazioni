-- Apply RLS policies fix directly to remote database
-- This fixes the anonymous insert issue

-- First, drop ALL existing policies on booking_requests
DROP POLICY IF EXISTS "Anyone can insert booking requests" ON booking_requests;
DROP POLICY IF EXISTS "anon_can_insert_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_select_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_update_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_delete_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can view all requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can update requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can delete requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow anonymous insert for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated select for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated update for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated delete for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow all select for booking requests" ON booking_requests;

-- Now create the correct policies
CREATE POLICY "anon_can_insert_booking_requests"
ON booking_requests
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "authenticated_can_insert_booking_requests"
ON booking_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_can_select_booking_requests"
ON booking_requests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_can_update_booking_requests"
ON booking_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_can_delete_booking_requests"
ON booking_requests
FOR DELETE
TO authenticated
USING (true);

