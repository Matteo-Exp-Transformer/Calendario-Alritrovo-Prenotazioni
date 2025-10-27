-- Fix anonymous insert for booking_requests
-- Drop old policy if exists
DROP POLICY IF EXISTS "Anyone can insert booking requests" ON booking_requests;

-- Create new policy that allows anonymous inserts
CREATE POLICY IF NOT EXISTS "anon_can_insert_booking_requests"
ON booking_requests
FOR INSERT
TO anon
WITH CHECK (true);

