-- Allow all inserts without any checks
DROP POLICY IF EXISTS "anon_can_insert_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_insert_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "public_can_insert_booking_requests" ON booking_requests;

CREATE POLICY "allow_all_inserts"
ON booking_requests
FOR INSERT
TO public
WITH CHECK (true);

