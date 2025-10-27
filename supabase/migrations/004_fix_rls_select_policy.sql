-- Fix RLS Policy: Restrict SELECT to authenticated users only
-- Anon users should NOT be able to read booking_requests

-- Remove the over-permissive SELECT policy
DROP POLICY IF EXISTS "Allow all select for booking requests" ON public.booking_requests;

-- Create proper SELECT policy: Only authenticated users can read
CREATE POLICY "Allow authenticated select for booking requests"
  ON public.booking_requests FOR SELECT
  USING (auth.role() = 'authenticated');

-- Keep INSERT policy for anon (public form)
-- INSERT policy already exists and is correct: "Allow anonymous insert for booking requests"

-- Keep UPDATE/DELETE policies for authenticated
-- These already exist and are correct

