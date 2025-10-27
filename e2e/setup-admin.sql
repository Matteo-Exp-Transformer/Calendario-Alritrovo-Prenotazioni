-- E2E Test Admin User Setup
-- Run this SQL in Supabase SQL Editor to create the admin user for E2E tests
--
-- This will:
-- 1. Create an auth user (if not exists)
-- 2. Add the user to admin_users table with admin role

-- Insert into admin_users table (bypassing RLS with service role)
INSERT INTO admin_users (email, name, role, created_at, updated_at)
VALUES (
  'admin@alritrovo.com',
  'Admin Test User',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the user was created
SELECT * FROM admin_users WHERE email = 'admin@alritrovo.com';
