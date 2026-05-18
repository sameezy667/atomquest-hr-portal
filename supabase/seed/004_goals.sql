-- =============================================================
-- @file 004_goals.sql
-- @description Seed: Individual goals for each employee's sheet.
--              Total weightage = 100% per sheet.
--              Covers all 4 UoM types across different goals.
-- @module supabase/seed
-- =============================================================

-- -------------------------------------------------------
-- ARUN MEHTA (approved, locked) — s001 — 5 goals, 100%
-- -------------------------------------------------------
INSERT INTO goals (id, sheet_id, employee_id, thrust_area, title, description, uom_type, target, weightage, display_order) VALUES
  ('g0001-0001', 's0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   'Technical Excellence', 'Reduce system downtime',
   'Maintain infrastructure uptime above 99.5% SLA through proactive monitoring and incident response.',
   'max', 0.5, 25, 1),

  ('g0001-0002', 's0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   'Delivery', 'Complete microservices migration',
   'Migrate 3 legacy monolith modules to microservices architecture by Q3.',
   'min', 3, 20, 2),

  ('g0001-0003', 's0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   'Learning & Development', 'AWS Certification',
   'Obtain AWS Solutions Architect Associate certification.',
   'timeline', 100, 20, 3),

  ('g0001-0004', 's0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   'Code Quality', 'Achieve zero critical bugs in production',
   'Ensure no P1/P2 bugs escape to production in owned modules.',
   'zero_based', 0, 20, 4),

  ('g0001-0005', 's0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   'Collaboration', 'Mentor junior engineers',
   'Conduct bi-weekly 1:1 mentoring sessions for 2 junior engineers.',
   'min', 24, 15, 5);

-- -------------------------------------------------------
-- PRIYA SHARMA (submitted) — s002 — 4 goals, 100%
-- -------------------------------------------------------
INSERT INTO goals (id, sheet_id, employee_id, thrust_area, title, description, uom_type, target, weightage, display_order) VALUES
  ('g0002-0001', 's0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002',
   'Delivery', 'Ship mobile app v2.0',
   'Deliver all planned features for mobile app version 2.0 on schedule.',
   'timeline', 100, 30, 1),

  ('g0002-0002', 's0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002',
   'Quality', 'Test coverage above 80%',
   'Maintain automated test coverage above 80% for all owned modules.',
   'min', 80, 30, 2),

  ('g0002-0003', 's0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002',
   'Technical Excellence', 'API response time optimisation',
   'Reduce average API response time from 800ms to under 300ms.',
   'max', 300, 25, 3),

  ('g0002-0004', 's0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002',
   'Learning', 'React Native advanced certification',
   'Complete official React Native advanced course.',
   'timeline', 100, 15, 4);

-- -------------------------------------------------------
-- VIKRAM TIWARI (draft) — s003 — 3 goals so far (incomplete, 70% total — valid draft)
-- -------------------------------------------------------
INSERT INTO goals (id, sheet_id, employee_id, thrust_area, title, description, uom_type, target, weightage, display_order) VALUES
  ('g0003-0001', 's0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003',
   'Delivery', 'Complete assigned sprint tasks on time',
   'Achieve 90% on-time completion rate for sprint tasks.',
   'min', 90, 30, 1),

  ('g0003-0002', 's0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003',
   'Learning', 'Complete Docker & Kubernetes training',
   'Complete Udemy course on container orchestration.',
   'timeline', 100, 25, 2),

  ('g0003-0003', 's0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003',
   'Quality', 'Zero regression defects introduced',
   'Ensure no new regression bugs are introduced in feature branches.',
   'zero_based', 0, 15, 3);

-- -------------------------------------------------------
-- KAVYA RAO (returned) — s004 — 4 goals, 100%
-- -------------------------------------------------------
INSERT INTO goals (id, sheet_id, employee_id, thrust_area, title, description, uom_type, target, weightage, display_order) VALUES
  ('g0004-0001', 's0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004',
   'Technical Excellence', 'Code review turnaround',
   'Review and close code review requests within 24 hours.',
   'max', 24, 25, 1),

  ('g0004-0002', 's0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004',
   'Delivery', 'Feature delivery rate',
   'Deliver at least 8 features across the year.',
   'min', 8, 30, 2),

  ('g0004-0003', 's0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004',
   'Innovation', 'Submit process improvement proposals',
   'Submit 2 documented process improvement proposals to team lead.',
   'min', 2, 25, 3),

  ('g0004-0004', 's0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004',
   'Collaboration', 'Cross-team project contribution',
   'Actively contribute to at least 1 cross-functional team project.',
   'min', 1, 20, 4);

-- -------------------------------------------------------
-- DEEPA LAL (approved, locked) — s005 — 4 goals, 100%
-- -------------------------------------------------------
INSERT INTO goals (id, sheet_id, employee_id, thrust_area, title, description, uom_type, target, weightage, display_order) VALUES
  ('g0005-0001', 's0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005',
   'Quality', 'Defect detection rate',
   'Identify and log 95% of defects before production release.',
   'min', 95, 30, 1),

  ('g0005-0002', 's0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005',
   'Automation', 'Automated test suite coverage',
   'Expand automated test suite to cover 200 test cases.',
   'min', 200, 30, 2),

  ('g0005-0003', 's0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005',
   'Process', 'Zero escaped defects',
   'Ensure zero critical defects escape to production.',
   'zero_based', 0, 25, 3),

  ('g0005-0004', 's0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005',
   'Delivery', 'Test cycle turnaround',
   'Complete full regression test cycle within 3 business days.',
   'max', 3, 15, 4);

-- -------------------------------------------------------
-- SANA BAIG (approved, locked) — s006 — 4 goals, 100%
-- -------------------------------------------------------
INSERT INTO goals (id, sheet_id, employee_id, thrust_area, title, description, uom_type, target, weightage, display_order) VALUES
  ('g0006-0001', 's0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006',
   'Strategy', 'Product roadmap completion',
   'Deliver 85% of planned roadmap items for 2026.',
   'min', 85, 30, 1),

  ('g0006-0002', 's0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006',
   'Customer', 'NPS score improvement',
   'Improve product NPS from 32 to 45 by year-end.',
   'min', 45, 25, 2),

  ('g0006-0003', 's0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006',
   'Delivery', 'Feature launch on schedule',
   'Launch all planned features with no more than 2-week delay.',
   'max', 14, 25, 3),

  ('g0006-0004', 's0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006',
   'Collaboration', 'Stakeholder alignment sessions',
   'Conduct monthly stakeholder alignment workshops — 12 sessions.',
   'min', 12, 20, 4);

-- -------------------------------------------------------
-- NIKHIL PATEL (submitted) — s007 — 4 goals, 100%
-- -------------------------------------------------------
INSERT INTO goals (id, sheet_id, employee_id, thrust_area, title, description, uom_type, target, weightage, display_order) VALUES
  ('g0007-0001', 's0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007',
   'Analysis', 'Market research reports',
   'Deliver 4 quarterly market research reports to product leadership.',
   'min', 4, 30, 1),

  ('g0007-0002', 's0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007',
   'Data', 'Dashboard adoption rate',
   'Achieve 80% adoption of self-serve analytics dashboards among stakeholders.',
   'min', 80, 30, 2),

  ('g0007-0003', 's0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007',
   'Process', 'Reduce reporting turnaround',
   'Reduce ad-hoc report turnaround from 5 days to 2 days.',
   'max', 2, 25, 3),

  ('g0007-0004', 's0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007',
   'Learning', 'Data analytics certification',
   'Complete Google Data Analytics Professional Certificate.',
   'timeline', 100, 15, 4);
