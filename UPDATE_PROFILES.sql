-- Update the profiles that were auto-created
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
