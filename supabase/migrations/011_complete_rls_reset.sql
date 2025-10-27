-- Complete RLS policy reset for booking_requests
-- Drop ALL existing policies
DROP POLICY IF EXISTS "anon_can_insert_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_insert_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "public_can_insert_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_select_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_update_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_delete_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "allow_all_inserts" ON booking_requests;
DROP POLICY IF EXISTS "Anyone can insert booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can view all requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can update requests" ON booking_requests;
DROP POLICY IF EXISTS "Only admins can delete requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow anonymous insert for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated select for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated update for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow authenticated delete for booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow all select for booking requests" ON booking_requests;

-- Now create SIMPLE, clean policies

-- Policy 1: Anyone can insert (for public booking form)
CREATE POLICY "Anyone can insert"
ON booking_requests
FOR INSERT
WITH CHECK (true);

-- Policy 2: Only authenticated can select (for admin dashboard)  
CREATE POLICY "Authenticated can select"
ON booking_requests
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy 3: Only authenticated can update
CREATE POLICY "Authenticated can update"
ON booking_requests
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (true);

-- Policy 4: Only authenticated can delete
CREATE POLICY "Authenticated can delete"
ON booking_requests
FOR DELETE
USING (auth.role() = 'authenticated');

