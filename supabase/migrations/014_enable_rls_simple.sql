-- Re-enable RLS and create VERY simple policies

-- Enable RLS
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Drop everything
DROP POLICY IF EXISTS "Anyone can insert" ON booking_requests;
DROP POLICY IF EXISTS "no_restriction_insert" ON booking_requests;
DROP POLICY IF EXISTS "Authenticated can select" ON booking_requests;
DROP POLICY IF EXISTS "Authenticated can update" ON booking_requests;
DROP POLICY IF EXISTS "Authenticated can delete" ON booking_requests;

-- Create simplest possible policies
CREATE POLICY "insert_all" ON booking_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "select_auth" ON booking_requests FOR SELECT USING (auth.role() = 'authenticated');

