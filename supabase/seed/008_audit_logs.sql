-- =============================================================
-- @file 008_audit_logs.sql
-- @description Seed: Sample audit log entries demonstrating
--              the audit trail for key lifecycle events.
-- @module supabase/seed
-- =============================================================

INSERT INTO audit_logs (table_name, record_id, action, changed_by, changed_at, old_values, new_values, change_summary) VALUES
  -- Arun's sheet: submitted
  ('goal_sheets', 's0000000-0000-0000-0000-000000000001', 'UPDATE',
   'e0000000-0000-0000-0000-000000000001', '2026-02-10 09:00:00+00',
   '{"status": "draft"}',
   '{"status": "submitted", "submitted_at": "2026-02-10T09:00:00Z"}',
   'Employee submitted goal sheet for manager review'),

  -- Meera approved Arun's sheet
  ('goal_sheets', 's0000000-0000-0000-0000-000000000001', 'UPDATE',
   'm0000000-0000-0000-0000-000000000001', '2026-02-15 11:00:00+00',
   '{"status": "submitted", "is_locked": false}',
   '{"status": "approved", "is_locked": true, "approved_at": "2026-02-15T11:00:00Z"}',
   'Manager approved and locked goal sheet'),

  -- Kavya's sheet: submitted then returned
  ('goal_sheets', 's0000000-0000-0000-0000-000000000004', 'UPDATE',
   'e0000000-0000-0000-0000-000000000004', '2026-02-12 14:00:00+00',
   '{"status": "draft"}',
   '{"status": "submitted"}',
   'Employee submitted goal sheet for manager review'),

  ('goal_sheets', 's0000000-0000-0000-0000-000000000004', 'UPDATE',
   'm0000000-0000-0000-0000-000000000001', '2026-02-14 16:00:00+00',
   '{"status": "submitted"}',
   '{"status": "returned", "return_reason": "Weightage distribution needs review. Goal 3 target is not measurable."}',
   'Manager returned goal sheet for rework'),

  -- Manager edited Priya''s goal weightage during review
  ('goals', 'g0002-0003', 'UPDATE',
   'm0000000-0000-0000-0000-000000000001', '2026-02-19 10:00:00+00',
   '{"weightage": 20}',
   '{"weightage": 25}',
   'Manager adjusted goal weightage during review'),

  -- Arun Q1 achievement entered
  ('quarterly_achievements', 'g0001-0001', 'INSERT',
   'e0000000-0000-0000-0000-000000000001', '2026-04-05 10:00:00+00',
   NULL,
   '{"actual_achievement": 0.3, "status": "completed", "progress_score": 100}',
   'Employee entered Q1 achievement for goal: Reduce system downtime');
