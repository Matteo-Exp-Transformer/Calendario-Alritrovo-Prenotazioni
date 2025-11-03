-- Add UPDATE and DELETE policies for booking_requests
-- This allows authenticated admins to reject and delete bookings

-- Enable RLS if not already enabled (this is idempotent)
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing UPDATE/DELETE policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated can update" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_update_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "update_auth" ON booking_requests;
DROP POLICY IF EXISTS "Authenticated can delete" ON booking_requests;
DROP POLICY IF EXISTS "authenticated_can_delete_booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "delete_auth" ON booking_requests;

-- Policy for UPDATE: Allow authenticated users to update bookings (for accepting/rejecting)
CREATE POLICY "update_auth" 
ON booking_requests 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy for DELETE: Allow authenticated users to delete bookings
CREATE POLICY "delete_auth" 
ON booking_requests 
FOR DELETE 
USING (auth.role() = 'authenticated');

