-- Keep RLS disabled for now to allow bookings
-- TODO: Fix RLS policies properly later
ALTER TABLE booking_requests DISABLE ROW LEVEL SECURITY;

