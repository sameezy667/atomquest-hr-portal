-- ============================================================================
-- FIX: Auto-create profiles for existing auth users
-- ============================================================================

-- Step 1: Create trigger to auto-create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 2: Create profiles for existing auth users that don't have profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'employee' as role
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Step 3: Now update the profiles with correct information
UPDATE profiles SET 
  full_name = 'Arun Mehta',
  role = 'employee',
  designation = 'Senior Software Engineer',
  department_id = 'd0000000-0000-0000-0000-000000000001'
WHERE email = 'arun.m@atomq.com';

UPDATE profiles SET 
  full_name = 'Meera Kumar',
  role = 'manager',
  designation = 'Engineering Manager',
  department_id = 'd0000000-0000-0000-0000-000000000001'
WHERE email = 'meera.k@atomq.com';

UPDATE profiles SET 
  full_name = 'Admin User',
  role = 'admin',
  designation = 'HR Administrator',
  department_id = NULL
WHERE email = 'admin@atomq.com';

-- Set Arun's manager to Meera
UPDATE profiles SET 
  manager_id = (SELECT id FROM profiles WHERE email = 'meera.k@atomq.com')
WHERE email = 'arun.m@atomq.com';

-- Verify the profiles were created
SELECT id, email, full_name, role, designation 
FROM profiles 
ORDER BY role, full_name;
