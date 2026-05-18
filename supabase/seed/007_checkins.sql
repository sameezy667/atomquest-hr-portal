-- =============================================================
-- @file 007_checkins.sql
-- @description Seed: Manager check-in comments for Q1
-- @module supabase/seed
-- =============================================================

INSERT INTO manager_checkins (sheet_id, manager_id, employee_id, quarter, cycle_year, comment, overall_rating) VALUES
  -- Arun Mehta Q1 check-in by Meera
  ('s0000000-0000-0000-0000-000000000001',
   'm0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000001',
   'q1', 2026,
   'Arun has had an excellent Q1. Uptime goal is tracking well — the 0.3% downtime shows strong discipline. Microservices migration is on schedule. AWS cert progress is good, encourage him to keep the study cadence. Mentoring sessions are valuable for the team.',
   'exceeds'),

  -- Deepa Lal Q1 check-in by Meera
  ('s0000000-0000-0000-0000-000000000005',
   'm0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000005',
   'q1', 2026,
   'Deepa performed very well in Q1. 97% defect detection is above target. The automated test suite expansion is on pace. Continue focusing on the zero-escaped-defects goal — this is critical for team quality standards.',
   'exceeds'),

  -- Sana Baig Q1 check-in by Rajan
  ('s0000000-0000-0000-0000-000000000006',
   'm0000000-0000-0000-0000-000000000002',
   'e0000000-0000-0000-0000-000000000006',
   'q1', 2026,
   'Sana has shown good progress on NPS improvement — moving from 32 to 36 in one quarter is strong. Feature delivery delays need attention; please tighten sprint planning and stakeholder communication for Q2.',
   'meets');
