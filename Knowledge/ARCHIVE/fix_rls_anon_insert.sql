-- Fix RLS to allow anonymous inserts for booking_requests
-- Run this manually in Supabase SQL Editor

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can insert booking requests" ON booking_requests;

-- Create new policy that explicitly allows anon role
CREATE POLICY "anon_can_insert_booking_requests"
ON booking_requests
FOR INSERT
TO anon
WITH CHECK (true);

