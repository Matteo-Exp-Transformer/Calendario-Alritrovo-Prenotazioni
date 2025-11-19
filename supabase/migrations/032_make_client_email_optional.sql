-- Make client_email optional (nullable) in booking_requests table
-- This allows bookings to be created/updated without requiring an email

ALTER TABLE booking_requests 
ALTER COLUMN client_email DROP NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN booking_requests.client_email IS 'Email del cliente (opzionale)';

