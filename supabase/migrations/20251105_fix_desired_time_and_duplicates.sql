-- 1. Backfill desired_time from confirmed_start when missing
UPDATE booking_requests
SET desired_time = (confirmed_start AT TIME ZONE 'UTC')::time(0)
WHERE desired_time IS NULL
  AND confirmed_start IS NOT NULL;

-- 2. Remove duplicate pending requests (keep the oldest entry)
WITH ranked_pending AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY client_email, desired_date, desired_time
      ORDER BY created_at ASC
    ) AS rn
  FROM booking_requests
  WHERE status = 'pending'
    AND desired_time IS NOT NULL
)
DELETE FROM booking_requests
WHERE id IN (
  SELECT id
  FROM ranked_pending
  WHERE rn > 1
);

-- 3. Ensure desired_time is always populated when possible
CREATE OR REPLACE FUNCTION public.fill_desired_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.desired_time IS NULL THEN
    IF NEW.confirmed_start IS NOT NULL THEN
      NEW.desired_time := (NEW.confirmed_start AT TIME ZONE 'UTC')::time(0);
    ELSIF TG_OP = 'UPDATE' AND OLD.desired_time IS NOT NULL THEN
      NEW.desired_time := OLD.desired_time;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach trigger to booking_requests table
DROP TRIGGER IF EXISTS trg_fill_desired_time ON booking_requests;
CREATE TRIGGER trg_fill_desired_time
  BEFORE INSERT OR UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION public.fill_desired_time();

-- 5. Prevent future duplicate pending requests (same email/date/time)
DROP INDEX IF EXISTS booking_requests_unique_pending;
CREATE UNIQUE INDEX booking_requests_unique_pending
  ON booking_requests (client_email, desired_date, desired_time)
  WHERE status = 'pending'
    AND desired_time IS NOT NULL;
