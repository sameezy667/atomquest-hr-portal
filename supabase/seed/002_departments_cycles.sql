-- =============================================================
-- @file 002_departments_cycles.sql
-- @description Seed: Goal Cycles for 2026
-- @module supabase/seed
-- =============================================================

INSERT INTO goal_cycles (id, name, cycle_year, cycle_type, start_date, end_date, is_active) VALUES
  -- Goal Setting window (Q1 of the year)
  ('c0000000-0000-0000-0000-000000000001', 'FY2026 Goal Setting', 2026, 'goal_setting', '2026-01-01', '2026-02-28', FALSE),
  -- Quarterly review windows
  ('c0000000-0000-0000-0000-000000000002', 'FY2026 Q1 Review',    2026, 'q1',           '2026-03-20', '2026-04-10', FALSE),
  ('c0000000-0000-0000-0000-000000000003', 'FY2026 Q2 Review',    2026, 'q2',           '2026-06-20', '2026-07-10', TRUE),
  ('c0000000-0000-0000-0000-000000000004', 'FY2026 Q3 Review',    2026, 'q3',           '2026-09-20', '2026-10-10', FALSE),
  ('c0000000-0000-0000-0000-000000000005', 'FY2026 Q4 Annual',    2026, 'q4_annual',    '2026-12-15', '2026-12-31', FALSE);
