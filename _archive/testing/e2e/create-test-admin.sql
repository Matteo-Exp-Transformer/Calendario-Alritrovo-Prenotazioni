-- Create Test Admin User for E2E Tests
-- Email: 0cavuz0@gmail.com
-- Password: Cavallaro

-- First check if user exists
DO $$
BEGIN
  -- Delete existing test admin if present
  DELETE FROM admin_users WHERE email = '0cavuz0@gmail.com';

  -- Insert test admin user
  -- Password hash for 'Cavallaro' using bcrypt
  -- You need to generate this using bcrypt in Node.js or use Supabase auth
  INSERT INTO admin_users (email, password_hash, role, name)
  VALUES (
    '0cavuz0@gmail.com',
    '$2a$10$YourBcryptHashHere', -- Replace with actual hash
    'admin',
    'Test Admin'
  );

  RAISE NOTICE 'Test admin user created successfully';
END $$;

-- Alternative: Use Supabase Auth instead
-- Run this in Node.js with Supabase client:
--
-- const { data, error } = await supabase.auth.signUp({
--   email: '0cavuz0@gmail.com',
--   password: 'Cavallaro',
--   options: {
--     data: {
--       role: 'admin',
--       name: 'Test Admin'
--     }
--   }
-- })
