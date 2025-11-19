-- Migration: Add 'deleted' status to booking_requests
-- Description: Extends the status check constraint to include 'deleted' status
--              to distinguish between rejected requests and deleted/cancelled bookings

-- Remove existing status constraint
ALTER TABLE booking_requests
DROP CONSTRAINT IF EXISTS booking_requests_status_check;

-- Add new constraint with 'deleted' status
ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_status_check
CHECK (status IN ('pending', 'accepted', 'rejected', 'deleted'));

-- Add comment explaining the status values
COMMENT ON COLUMN booking_requests.status IS
'Booking status: pending (awaiting admin approval), accepted (confirmed), rejected (admin declined request), deleted (admin removed accepted booking - can be restored)';
