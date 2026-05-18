-- =============================================================
-- @file 005_shared_goals.sql
-- @description Seed: Shared goal group (Department OKR)
--              Arun (primary) + Deepa (member) share the same
--              engineering uptime OKR. Achievements sync via trigger.
-- @module supabase/seed
-- =============================================================

-- Shared goal group: Engineering Availability SLA (cross-team OKR)
INSERT INTO shared_goal_groups (id, title, description, thrust_area, uom_type, target, cycle_year, department_id, created_by) VALUES
  ('sg000000-0000-0000-0000-000000000001',
   'Engineering Availability SLA 99.5%',
   'Shared departmental OKR: all engineers contribute to maintaining system uptime above 99.5% SLA throughout the year.',
   'Technical Excellence',
   'max',
   0.5,
   2026,
   'd1000000-0000-0000-0000-000000000001',
   'm0000000-0000-0000-0000-000000000001');

-- Members: Arun = primary owner, Deepa = member
-- NOTE: goal_ids reference the already-seeded goals above
INSERT INTO shared_goal_members (id, group_id, employee_id, goal_id, is_primary, weightage) VALUES
  ('sm000000-0000-0000-0000-000000000001',
   'sg000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000001',  -- Arun
   'g0001-0001',                             -- Arun's uptime goal
   TRUE,
   25),

  ('sm000000-0000-0000-0000-000000000002',
   'sg000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000005',  -- Deepa
   'g0005-0004',                             -- Deepa's closest matching goal (re-use for demo)
   FALSE,
   15);

-- Mark Arun's goal as primary shared & Deepa's as read-only recipient
UPDATE goals SET
  shared_group_id    = 'sg000000-0000-0000-0000-000000000001',
  is_shared_primary  = TRUE,
  is_title_readonly  = FALSE,
  is_target_readonly = FALSE
WHERE id = 'g0001-0001';

UPDATE goals SET
  shared_group_id    = 'sg000000-0000-0000-0000-000000000001',
  is_shared_primary  = FALSE,
  is_title_readonly  = TRUE,
  is_target_readonly = TRUE
WHERE id = 'g0005-0004';
