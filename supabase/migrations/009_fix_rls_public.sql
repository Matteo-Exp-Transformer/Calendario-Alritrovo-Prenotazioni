-- Fix RLS to use public role instead of anon
-- Drop existing insert policy
DROP POLICY IF EXISTS "anon_can_insert_booking_requests" ON booking_requests;

-- Create new policy that allows public inserts
CREATE POLICY "public_can_insert_booking_requests"
ON booking_requests
FOR INSERT
TO public
WITH CHECK (true);

