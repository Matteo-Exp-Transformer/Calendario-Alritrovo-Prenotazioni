-- Create a policy with NO restrictions at all
DROP POLICY IF EXISTS "Anyone can insert" ON booking_requests;

CREATE POLICY "no_restriction_insert"
ON booking_requests
FOR INSERT
TO public
WITH CHECK (true);

