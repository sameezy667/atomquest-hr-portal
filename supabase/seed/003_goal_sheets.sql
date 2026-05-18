-- =============================================================
-- @file 003_goal_sheets.sql
-- @description Seed: Goal sheets covering all 4 demo states:
--              approved+locked, submitted, draft, returned
-- @module supabase/seed
-- =============================================================

-- Arun Mehta — APPROVED + LOCKED
INSERT INTO goal_sheets (id, employee_id, cycle_year, status, is_locked, submitted_at, approved_at, approved_by) VALUES
  ('s0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000001',
   2026, 'approved', TRUE,
   '2026-02-10 09:00:00+00',
   '2026-02-15 11:00:00+00',
   'm0000000-0000-0000-0000-000000000001');

-- Priya Sharma — SUBMITTED (pending manager review)
INSERT INTO goal_sheets (id, employee_id, cycle_year, status, is_locked, submitted_at) VALUES
  ('s0000000-0000-0000-0000-000000000002',
   'e0000000-0000-0000-0000-000000000002',
   2026, 'submitted', FALSE,
   '2026-02-18 10:30:00+00');

-- Vikram Tiwari — DRAFT
INSERT INTO goal_sheets (id, employee_id, cycle_year, status, is_locked) VALUES
  ('s0000000-0000-0000-0000-000000000003',
   'e0000000-0000-0000-0000-000000000003',
   2026, 'draft', FALSE);

-- Kavya Rao — RETURNED FOR REWORK
INSERT INTO goal_sheets (id, employee_id, cycle_year, status, is_locked, submitted_at, returned_at, returned_by, return_reason) VALUES
  ('s0000000-0000-0000-0000-000000000004',
   'e0000000-0000-0000-0000-000000000004',
   2026, 'returned', FALSE,
   '2026-02-12 14:00:00+00',
   '2026-02-14 16:00:00+00',
   'm0000000-0000-0000-0000-000000000001',
   'Weightage distribution needs review. Goal 3 target is not measurable. Please revise and resubmit.');

-- Deepa Lal — APPROVED + LOCKED
INSERT INTO goal_sheets (id, employee_id, cycle_year, status, is_locked, submitted_at, approved_at, approved_by) VALUES
  ('s0000000-0000-0000-0000-000000000005',
   'e0000000-0000-0000-0000-000000000005',
   2026, 'approved', TRUE,
   '2026-02-09 10:00:00+00',
   '2026-02-16 12:00:00+00',
   'm0000000-0000-0000-0000-000000000001');

-- Sana Baig — APPROVED + LOCKED (Product team)
INSERT INTO goal_sheets (id, employee_id, cycle_year, status, is_locked, submitted_at, approved_at, approved_by) VALUES
  ('s0000000-0000-0000-0000-000000000006',
   'e0000000-0000-0000-0000-000000000006',
   2026, 'approved', TRUE,
   '2026-02-11 11:00:00+00',
   '2026-02-17 10:00:00+00',
   'm0000000-0000-0000-0000-000000000002');

-- Nikhil Patel — SUBMITTED
INSERT INTO goal_sheets (id, employee_id, cycle_year, status, is_locked, submitted_at) VALUES
  ('s0000000-0000-0000-0000-000000000007',
   'e0000000-0000-0000-0000-000000000007',
   2026, 'submitted', FALSE,
   '2026-02-20 09:00:00+00');
