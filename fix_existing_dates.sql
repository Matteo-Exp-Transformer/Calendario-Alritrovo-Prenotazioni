-- Fix existing booking dates by removing timezone (Z) to avoid timezone conversion issues
-- This converts dates from UTC to local time format

UPDATE booking_requests 
SET confirmed_start = confirmed_start AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Rome',
    confirmed_end = confirmed_end AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Rome'
WHERE confirmed_start IS NOT NULL 
  AND confirmed_end IS NOT NULL;

-- This will convert UTC dates to Rome timezone and store them without timezone info
-- Example: 2024-01-15T20:00:00Z (UTC) -> 2024-01-15T21:00:00 (Rome) if it was 20:00 UTC

