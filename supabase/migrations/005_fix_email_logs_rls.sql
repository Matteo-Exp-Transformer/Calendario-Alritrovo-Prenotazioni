-- Fix RLS policy for email_logs to allow inserts
-- Allow inserts for everyone (for logging purposes)

DROP POLICY IF EXISTS "Only admins can view email logs" ON email_logs;
DROP POLICY IF EXISTS "Allow public insert for email logs" ON email_logs;
DROP POLICY IF EXISTS "Allow anonymous insert for email logs" ON email_logs;

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policy per SELECT: Solo admin possono vedere i log
CREATE POLICY "Only admins can view email logs"
  ON email_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy per INSERT: Permetti a tutti (anon e authenticated) di inserire log
CREATE POLICY "Allow anonymous insert for email logs"
  ON email_logs FOR INSERT
  WITH CHECK (true);

-- Policy per UPDATE: Nessuno può modificare i log (solo lettura)
-- Policy per DELETE: Nessuno può cancellare i log (solo lettura)

