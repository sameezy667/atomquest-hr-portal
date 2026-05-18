-- =============================================================
-- @file 001_users.sql
-- @description Seed: departments + auth users + profiles
--              Run AFTER schema migrations.
--              Uses Supabase auth admin API for users, then inserts profiles.
--
-- DEMO CREDENTIALS (all passwords: AtomQ@2026)
--   admin@atomq.com      → Admin / HR
--   meera.k@atomq.com    → Manager, Engineering
--   rajan.v@atomq.com    → Manager, Product
--   arun.m@atomq.com     → Employee, Engineering (approved locked sheet)
--   priya.s@atomq.com    → Employee, Engineering (submitted, pending)
--   vikram.t@atomq.com   → Employee, Engineering (draft)
--   kavya.r@atomq.com    → Employee, Engineering (returned for rework)
--   sana.b@atomq.com     → Employee, Product
--   nikhil.p@atomq.com   → Employee, Product
--   deepa.l@atomq.com    → Employee, Engineering
-- =============================================================

-- -------------------------------------------------------------
-- DEPARTMENTS
-- -------------------------------------------------------------
INSERT INTO departments (id, name, code) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Engineering',       'ENG'),
  ('d1000000-0000-0000-0000-000000000002', 'Product Management', 'PM'),
  ('d1000000-0000-0000-0000-000000000003', 'Human Resources',    'HR'),
  ('d1000000-0000-0000-0000-000000000004', 'Finance',            'FIN');

-- -------------------------------------------------------------
-- PROFILES  (auth.users must be created first via Supabase Auth Admin API
--            or Supabase Dashboard → Authentication → Users)
-- The UUIDs below must match the Supabase auth.users IDs.
-- Use the companion seed_auth.ts script to create auth users programmatically.
-- -------------------------------------------------------------

-- Admin
INSERT INTO profiles (id, email, full_name, role, department_id, employee_code, designation) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@atomq.com',    'Admin HR',       'admin',    'd1000000-0000-0000-0000-000000000003', 'EMP000', 'HR Administrator');

-- Managers
INSERT INTO profiles (id, email, full_name, role, department_id, employee_code, designation) VALUES
  ('m0000000-0000-0000-0000-000000000001', 'meera.k@atomq.com',  'Meera Krishnan', 'manager',  'd1000000-0000-0000-0000-000000000001', 'EMP001', 'Engineering Manager'),
  ('m0000000-0000-0000-0000-000000000002', 'rajan.v@atomq.com',  'Rajan Verma',    'manager',  'd1000000-0000-0000-0000-000000000002', 'EMP002', 'Product Manager');

-- Engineering employees (report to Meera)
INSERT INTO profiles (id, email, full_name, role, department_id, manager_id, employee_code, designation) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'arun.m@atomq.com',   'Arun Mehta',     'employee', 'd1000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'EMP003', 'Senior Software Engineer'),
  ('e0000000-0000-0000-0000-000000000002', 'priya.s@atomq.com',  'Priya Sharma',   'employee', 'd1000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'EMP004', 'Software Engineer'),
  ('e0000000-0000-0000-0000-000000000003', 'vikram.t@atomq.com', 'Vikram Tiwari',  'employee', 'd1000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'EMP005', 'Junior Engineer'),
  ('e0000000-0000-0000-0000-000000000004', 'kavya.r@atomq.com',  'Kavya Rao',      'employee', 'd1000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'EMP006', 'Software Engineer'),
  ('e0000000-0000-0000-0000-000000000005', 'deepa.l@atomq.com',  'Deepa Lal',      'employee', 'd1000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'EMP007', 'QA Engineer');

-- Product employees (report to Rajan)
INSERT INTO profiles (id, email, full_name, role, department_id, manager_id, employee_code, designation) VALUES
  ('e0000000-0000-0000-0000-000000000006', 'sana.b@atomq.com',   'Sana Baig',      'employee', 'd1000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000002', 'EMP008', 'Product Analyst'),
  ('e0000000-0000-0000-0000-000000000007', 'nikhil.p@atomq.com', 'Nikhil Patel',   'employee', 'd1000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000002', 'EMP009', 'Business Analyst');

-- Set department heads
UPDATE departments SET head_id = 'm0000000-0000-0000-0000-000000000001' WHERE id = 'd1000000-0000-0000-0000-000000000001';
UPDATE departments SET head_id = 'm0000000-0000-0000-0000-000000000002' WHERE id = 'd1000000-0000-0000-0000-000000000002';
UPDATE departments SET head_id = 'a0000000-0000-0000-0000-000000000001' WHERE id = 'd1000000-0000-0000-0000-000000000003';
