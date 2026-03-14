-- Remove password_hash and role columns from admin_users
-- Passwords are managed by Supabase Auth, not this table.
-- Role concept has been removed - all users in this table are authorized.

-- 1. Drop the policy that depends on admin_users.role
DROP POLICY IF EXISTS "Only admins can manage menu items" ON menu_items;

-- 2. Recreate the policy without role check (any user in admin_users is authorized)
CREATE POLICY "Only authorized users can manage menu items"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- 3. Now safe to drop the columns
ALTER TABLE admin_users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE admin_users DROP COLUMN IF EXISTS role;
