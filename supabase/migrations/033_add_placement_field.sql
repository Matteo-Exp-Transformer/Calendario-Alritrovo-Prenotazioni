-- Add placement field to booking_requests table
-- Allows specifying the seating/placement area for bookings
-- Valid values: "Sala A", "Sala B", "Deorr" (or null for unspecified)

ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS placement VARCHAR(50) NULL;

-- Add comment to document the field
COMMENT ON COLUMN booking_requests.placement IS 'Posizionamento/ubicazione del tavolo (es: Sala A, Sala B, Deorr) - campo opzionale';

-- Note: RLS policies don't need updates as they use SELECT * or specific columns
-- The existing policies will automatically include this new column
