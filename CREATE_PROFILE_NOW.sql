-- CREATE_PROFILE_NOW.sql
-- URGENT: Run this in Supabase SQL Editor RIGHT NOW to fix the stuck loading

-- First, fix the RLS policy to allow profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create profile for the user that's currently stuck (from your console log)
INSERT INTO profiles (id, email, full_name, role, designation, department_id)
VALUES (
  '717cc95f-c62c-41a0-b8bc-174a0bf9e4ce',
  (SELECT email FROM auth.users WHERE id = '717cc95f-c62c-41a0-b8bc-174a0bf9e4ce'),
  'Admin User',
  'admin',
  'System Administrator',
  (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  full_name = 'Admin User',
  designation = 'System Administrator';

-- Verify it was created
SELECT id, email, full_name, role, designation FROM profiles 
WHERE id = '717cc95f-c62c-41a0-b8bc-174a0bf9e4ce';

-- Show success message
SELECT 'Profile created! Now refresh your browser and login again.' as message;
