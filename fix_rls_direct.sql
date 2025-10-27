-- Fix RLS policies directly
DROP POLICY IF EXISTS "Anyone can insert booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can view all requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can update requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can delete requests" ON booking_requests;

-- Create proper policies for anonymous inserts
CREATE POLICY "anon_can_insert_booking_requests"
ON booking_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Recreate other policies
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

