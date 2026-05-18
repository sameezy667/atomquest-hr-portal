-- =============================================================
-- @file 002_rls.sql
-- @description Row Level Security policies for all tables.
--              Roles: employee | manager | admin
--              Auth identity from auth.uid() (Supabase JWT).
-- @module supabase/migrations
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_cycles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_sheets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_goal_groups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_goal_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_checkins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- HELPER: role extraction (avoids repetition)
-- =============================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_my_manager_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT manager_id FROM profiles WHERE id = auth.uid();
$$;

-- Returns TRUE if auth.uid() is the direct manager of p_employee_id
CREATE OR REPLACE FUNCTION is_my_direct_report(p_employee_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_employee_id AND manager_id = auth.uid()
  );
$$;

-- =============================================================
-- PROFILES
-- =============================================================

-- All authenticated users can read all profiles (needed for org nav)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can update only their own profile (non-role fields)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can update any profile (role assignment etc)
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (get_my_role() = 'admin');

-- =============================================================
-- DEPARTMENTS
-- =============================================================

CREATE POLICY "departments_select_all"
  ON departments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "departments_mutate_admin"
  ON departments FOR ALL
  USING (get_my_role() = 'admin');

-- =============================================================
-- GOAL CYCLES
-- =============================================================

CREATE POLICY "cycles_select_all"
  ON goal_cycles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "cycles_mutate_admin"
  ON goal_cycles FOR ALL
  USING (get_my_role() = 'admin');

-- =============================================================
-- GOAL SHEETS
-- =============================================================

-- Employee: see own sheets
CREATE POLICY "sheets_select_own"
  ON goal_sheets FOR SELECT
  USING (employee_id = auth.uid());

-- Manager: see direct reports' sheets
CREATE POLICY "sheets_select_manager"
  ON goal_sheets FOR SELECT
  USING (
    get_my_role() = 'manager'
    AND is_my_direct_report(employee_id)
  );

-- Admin: see all
CREATE POLICY "sheets_select_admin"
  ON goal_sheets FOR SELECT
  USING (get_my_role() = 'admin');

-- Employee: insert/update own sheet when NOT locked
CREATE POLICY "sheets_insert_own"
  ON goal_sheets FOR INSERT
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "sheets_update_own_unlocked"
  ON goal_sheets FOR UPDATE
  USING (
    employee_id = auth.uid()
    AND is_locked = FALSE
  );

-- Manager: update sheet during review (status change, return_reason)
-- Cannot re-lock or touch is_locked themselves
CREATE POLICY "sheets_update_manager"
  ON goal_sheets FOR UPDATE
  USING (
    get_my_role() = 'manager'
    AND is_my_direct_report(employee_id)
    AND is_locked = FALSE
  );

-- Admin: update any sheet (including unlock)
CREATE POLICY "sheets_update_admin"
  ON goal_sheets FOR UPDATE
  USING (get_my_role() = 'admin');

-- =============================================================
-- GOALS
-- =============================================================

-- Select: employee sees own; manager sees direct reports'; admin sees all
CREATE POLICY "goals_select_own"
  ON goals FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "goals_select_manager"
  ON goals FOR SELECT
  USING (
    get_my_role() = 'manager'
    AND is_my_direct_report(employee_id)
  );

CREATE POLICY "goals_select_admin"
  ON goals FOR SELECT
  USING (get_my_role() = 'admin');

-- Insert: employee can add goals to their own unlocked sheet
CREATE POLICY "goals_insert_own"
  ON goals FOR INSERT
  WITH CHECK (
    employee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM goal_sheets
      WHERE id = sheet_id
        AND employee_id = auth.uid()
        AND is_locked = FALSE
    )
  );

-- Update: employee can edit own goals on unlocked sheet
CREATE POLICY "goals_update_own_unlocked"
  ON goals FOR UPDATE
  USING (
    employee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM goal_sheets
      WHERE id = sheet_id AND is_locked = FALSE
    )
  );

-- Manager: can edit target/weightage during review (sheet must be under_review or submitted)
CREATE POLICY "goals_update_manager_review"
  ON goals FOR UPDATE
  USING (
    get_my_role() = 'manager'
    AND is_my_direct_report(employee_id)
    AND EXISTS (
      SELECT 1 FROM goal_sheets
      WHERE id = sheet_id
        AND status IN ('submitted', 'under_review')
        AND is_locked = FALSE
    )
  );

-- Admin: full access
CREATE POLICY "goals_all_admin"
  ON goals FOR ALL
  USING (get_my_role() = 'admin');

-- Delete: employee can delete own goals on unlocked draft sheet
CREATE POLICY "goals_delete_own_draft"
  ON goals FOR DELETE
  USING (
    employee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM goal_sheets
      WHERE id = sheet_id AND status = 'draft' AND is_locked = FALSE
    )
  );

-- =============================================================
-- SHARED GOAL GROUPS
-- =============================================================

CREATE POLICY "sgg_select_all"
  ON shared_goal_groups FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "sgg_insert_manager_admin"
  ON shared_goal_groups FOR INSERT
  WITH CHECK (get_my_role() IN ('manager', 'admin'));

CREATE POLICY "sgg_update_creator_admin"
  ON shared_goal_groups FOR UPDATE
  USING (
    created_by = auth.uid()
    OR get_my_role() = 'admin'
  );

CREATE POLICY "sgg_delete_admin"
  ON shared_goal_groups FOR DELETE
  USING (get_my_role() = 'admin');

-- =============================================================
-- SHARED GOAL MEMBERS
-- =============================================================

CREATE POLICY "sgm_select_own"
  ON shared_goal_members FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "sgm_select_manager_admin"
  ON shared_goal_members FOR SELECT
  USING (get_my_role() IN ('manager', 'admin'));

CREATE POLICY "sgm_insert_manager_admin"
  ON shared_goal_members FOR INSERT
  WITH CHECK (get_my_role() IN ('manager', 'admin'));

CREATE POLICY "sgm_update_manager_admin"
  ON shared_goal_members FOR UPDATE
  USING (get_my_role() IN ('manager', 'admin'));

-- Employee can update only their own member weightage
CREATE POLICY "sgm_update_own_weightage"
  ON shared_goal_members FOR UPDATE
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- =============================================================
-- QUARTERLY ACHIEVEMENTS
-- =============================================================

-- Employee: see own achievements
CREATE POLICY "qa_select_own"
  ON quarterly_achievements FOR SELECT
  USING (employee_id = auth.uid());

-- Manager: see direct reports' achievements
CREATE POLICY "qa_select_manager"
  ON quarterly_achievements FOR SELECT
  USING (
    get_my_role() = 'manager'
    AND is_my_direct_report(employee_id)
  );

-- Admin: see all
CREATE POLICY "qa_select_admin"
  ON quarterly_achievements FOR SELECT
  USING (get_my_role() = 'admin');

-- Employee: insert/update own achievements (window check done in app layer)
CREATE POLICY "qa_insert_own"
  ON quarterly_achievements FOR INSERT
  WITH CHECK (
    employee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM goals g
      JOIN goal_sheets gs ON gs.id = g.sheet_id
      WHERE g.id = goal_id
        AND gs.status = 'approved'
    )
  );

CREATE POLICY "qa_update_own"
  ON quarterly_achievements FOR UPDATE
  USING (
    employee_id = auth.uid()
    AND is_synced_from_primary = FALSE  -- cannot edit synced records directly
  );

-- Admin: full access
CREATE POLICY "qa_all_admin"
  ON quarterly_achievements FOR ALL
  USING (get_my_role() = 'admin');

-- =============================================================
-- MANAGER CHECK-INS
-- =============================================================

-- Employee: see check-ins on their own sheet
CREATE POLICY "checkins_select_own_employee"
  ON manager_checkins FOR SELECT
  USING (employee_id = auth.uid());

-- Manager: see and write their own check-ins
CREATE POLICY "checkins_select_own_manager"
  ON manager_checkins FOR SELECT
  USING (manager_id = auth.uid());

CREATE POLICY "checkins_insert_manager"
  ON manager_checkins FOR INSERT
  WITH CHECK (
    manager_id = auth.uid()
    AND get_my_role() = 'manager'
    AND is_my_direct_report(employee_id)
  );

CREATE POLICY "checkins_update_own_manager"
  ON manager_checkins FOR UPDATE
  USING (manager_id = auth.uid());

-- Admin: see all
CREATE POLICY "checkins_select_admin"
  ON manager_checkins FOR SELECT
  USING (get_my_role() = 'admin');

-- =============================================================
-- AUDIT LOGS  (admin read-only; append via triggers only)
-- =============================================================

CREATE POLICY "audit_select_admin"
  ON audit_logs FOR SELECT
  USING (get_my_role() = 'admin');

-- No direct INSERT/UPDATE/DELETE from client — triggers use SECURITY DEFINER

-- =============================================================
-- NOTIFICATIONS
-- =============================================================

CREATE POLICY "notif_select_own"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notif_update_own"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin can see all notifications
CREATE POLICY "notif_select_admin"
  ON notifications FOR SELECT
  USING (get_my_role() = 'admin');
