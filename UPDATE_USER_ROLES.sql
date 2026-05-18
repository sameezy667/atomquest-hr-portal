-- UPDATE_USER_ROLES.sql
-- Run this in Supabase SQL Editor to assign proper roles to your users
-- Replace the email addresses with your actual user emails

-- Update specific users with their roles
-- Replace 'user@example.com' with actual email addresses

-- Example: Set admin role
UPDATE profiles 
SET 
  role = 'admin',
  full_name = 'Admin User',
  designation = 'System Administrator',
  department_id = (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)
WHERE email = 'admin@atomquest.com';

-- Example: Set manager role
UPDATE profiles 
SET 
  role = 'manager',
  full_name = 'Manager User',
  designation = 'Engineering Manager',
  department_id = (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)
WHERE email = 'manager@atomquest.com';

-- Example: Set employee role
UPDATE profiles 
SET 
  role = 'employee',
  full_name = 'Employee User',
  designation = 'Software Engineer',
  department_id = (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)
WHERE email = 'employee@atomquest.com';

-- Verify the updates
SELECT 
  email,
  full_name,
  role,
  designation,
  department_id
FROM profiles
ORDER BY role, email;
