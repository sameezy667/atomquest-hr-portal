-- =============================================================
-- @file 006_achievements.sql
-- @description Seed: Quarterly achievements for approved sheets.
-- @module supabase/seed
-- =============================================================

-- ARUN MEHTA — Q1
INSERT INTO quarterly_achievements (goal_id, employee_id, quarter, cycle_year, planned_target, actual_achievement, achievement_notes, status, entered_by, entered_at) VALUES
  ('g0001-0001','e0000000-0000-0000-0000-000000000001','q1',2026,0.5,0.3,'Achieved 99.7% uptime. 2 minor incidents resolved within SLA.','completed','e0000000-0000-0000-0000-000000000001','2026-04-05 10:00:00+00'),
  ('g0001-0002','e0000000-0000-0000-0000-000000000001','q1',2026,3,1,'Completed Auth module migration.','on_track','e0000000-0000-0000-0000-000000000001','2026-04-05 10:00:00+00'),
  ('g0001-0003','e0000000-0000-0000-0000-000000000001','q1',2026,100,40,'40% of AWS course complete. Exam scheduled for June.','on_track','e0000000-0000-0000-0000-000000000001','2026-04-05 10:00:00+00'),
  ('g0001-0004','e0000000-0000-0000-0000-000000000001','q1',2026,0,0,'Zero P1/P2 bugs in production this quarter.','completed','e0000000-0000-0000-0000-000000000001','2026-04-05 10:00:00+00'),
  ('g0001-0005','e0000000-0000-0000-0000-000000000001','q1',2026,24,6,'6 mentoring sessions completed with juniors.','on_track','e0000000-0000-0000-0000-000000000001','2026-04-05 10:00:00+00');

-- ARUN MEHTA — Q2 (partial)
INSERT INTO quarterly_achievements (goal_id, employee_id, quarter, cycle_year, planned_target, actual_achievement, achievement_notes, status, entered_by, entered_at) VALUES
  ('g0001-0001','e0000000-0000-0000-0000-000000000001','q2',2026,0.5,0.4,'One maintenance window impacted uptime briefly, still within SLA.','on_track','e0000000-0000-0000-0000-000000000001','2026-05-10 10:00:00+00'),
  ('g0001-0002','e0000000-0000-0000-0000-000000000001','q2',2026,3,2,'Payment module migration completed.','on_track','e0000000-0000-0000-0000-000000000001','2026-05-10 10:00:00+00');

-- DEEPA LAL — Q1 (including shared goal sync record)
INSERT INTO quarterly_achievements (goal_id, employee_id, quarter, cycle_year, planned_target, actual_achievement, achievement_notes, status, is_synced_from_primary, entered_by, entered_at) VALUES
  ('g0005-0001','e0000000-0000-0000-0000-000000000005','q1',2026,95,97,'97% defect detection rate. Strong quarter.',  'completed',FALSE,'e0000000-0000-0000-0000-000000000005','2026-04-06 09:00:00+00'),
  ('g0005-0002','e0000000-0000-0000-0000-000000000005','q1',2026,200,80,'80 automated test cases added.',             'on_track', FALSE,'e0000000-0000-0000-0000-000000000005','2026-04-06 09:00:00+00'),
  ('g0005-0003','e0000000-0000-0000-0000-000000000005','q1',2026,0,0,'Zero critical escaped defects.',               'completed',FALSE,'e0000000-0000-0000-0000-000000000005','2026-04-06 09:00:00+00'),
  ('g0005-0004','e0000000-0000-0000-0000-000000000005','q1',2026,3,0.3,'[Synced from team OKR] 0.3% downtime in Q1.','completed',TRUE, 'e0000000-0000-0000-0000-000000000001','2026-04-05 10:00:00+00');

-- SANA BAIG — Q1
INSERT INTO quarterly_achievements (goal_id, employee_id, quarter, cycle_year, planned_target, actual_achievement, achievement_notes, status, entered_by, entered_at) VALUES
  ('g0006-0001','e0000000-0000-0000-0000-000000000006','q1',2026,85,22,'22 of 85 annual items delivered in Q1.','on_track','e0000000-0000-0000-0000-000000000006','2026-04-07 11:00:00+00'),
  ('g0006-0002','e0000000-0000-0000-0000-000000000006','q1',2026,45,36,'NPS improved from 32 to 36.','on_track','e0000000-0000-0000-0000-000000000006','2026-04-07 11:00:00+00'),
  ('g0006-0003','e0000000-0000-0000-0000-000000000006','q1',2026,14,10,'Two launches delayed 10 days.','on_track','e0000000-0000-0000-0000-000000000006','2026-04-07 11:00:00+00'),
  ('g0006-0004','e0000000-0000-0000-0000-000000000006','q1',2026,12,3,'3 stakeholder sessions in Q1.','on_track','e0000000-0000-0000-0000-000000000006','2026-04-07 11:00:00+00');
