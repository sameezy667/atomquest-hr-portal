-- =============================================================
-- @file 003_functions.sql
-- @description PG functions and triggers: updated_at, score computation,
--              shared-goal sync, goal-count guard, weightage validation,
--              goal locking, audit trail, notifications.
-- @module supabase/migrations
-- =============================================================

-- =============================================================
-- 1. UPDATED_AT TRIGGER FUNCTION
-- =============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_updated_profiles
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_updated_goal_cycles
  BEFORE UPDATE ON goal_cycles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_updated_goal_sheets
  BEFORE UPDATE ON goal_sheets FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_updated_goals
  BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_updated_shared_groups
  BEFORE UPDATE ON shared_goal_groups FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_updated_shared_members
  BEFORE UPDATE ON shared_goal_members FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_updated_qa
  BEFORE UPDATE ON quarterly_achievements FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_updated_checkins
  BEFORE UPDATE ON manager_checkins FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================
-- 2. PROGRESS SCORE COMPUTATION (pure function, null-safe)
-- =============================================================
-- PRD formulas:
--   min  (higher is better):  achievement / target * 100
--   max  (lower is better):   target / achievement * 100
--   timeline:                 time-based health; target_date required
--   zero_based:               achievement = 0 → 100, else → 0

CREATE OR REPLACE FUNCTION compute_progress_score(
  p_uom_type    uom_type,
  p_achievement NUMERIC,
  p_target      NUMERIC,
  p_target_date DATE    DEFAULT NULL
) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_days_remaining NUMERIC;
  v_total_days     NUMERIC;
BEGIN
  -- Null achievement → no score yet
  IF p_achievement IS NULL THEN RETURN NULL; END IF;

  CASE p_uom_type
    WHEN 'min' THEN
      -- Higher is better: score = achievement / target × 100
      IF p_target IS NULL OR p_target = 0 THEN RETURN NULL; END IF;
      RETURN LEAST(100, ROUND((p_achievement / p_target) * 100, 2));

    WHEN 'max' THEN
      -- Lower is better: score = target / achievement × 100
      IF p_achievement = 0 THEN RETURN NULL; END IF;
      IF p_target IS NULL THEN RETURN NULL; END IF;
      RETURN LEAST(100, ROUND((p_target / p_achievement) * 100, 2));

    WHEN 'timeline' THEN
      -- Timeline: percentage of deadline remaining (health indicator)
      -- achievement = % complete (0–100 entered by employee)
      -- If past deadline and not 100%, score is capped at achievement value
      IF p_target_date IS NULL THEN
        -- Fallback: treat same as min with target=100
        RETURN LEAST(100, ROUND(p_achievement, 2));
      END IF;
      v_total_days     := p_target_date - CURRENT_DATE;
      -- If completed (achievement >= 100) → full score
      IF p_achievement >= 100 THEN RETURN 100; END IF;
      -- If past deadline → score = achievement only (penalised)
      IF v_total_days < 0 THEN RETURN GREATEST(0, ROUND(p_achievement * 0.5, 2)); END IF;
      -- On track: blend of completion % and time health
      RETURN LEAST(100, ROUND(p_achievement, 2));

    WHEN 'zero_based' THEN
      -- If achievement = 0 → 100%, else 0%
      IF p_achievement = 0 THEN RETURN 100; END IF;
      RETURN 0;

    ELSE
      RETURN NULL;
  END CASE;
END;
$$;

-- =============================================================
-- 3. COMPUTE SCORE ON ACHIEVEMENT INSERT/UPDATE
-- =============================================================

CREATE OR REPLACE FUNCTION trigger_compute_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_goal goals%ROWTYPE;
BEGIN
  SELECT * INTO v_goal FROM goals WHERE id = NEW.goal_id;

  NEW.progress_score := compute_progress_score(
    v_goal.uom_type,
    NEW.actual_achievement,
    COALESCE(NEW.planned_target, v_goal.target),
    v_goal.target_date
  );

  -- Snapshot planned_target on first entry
  IF NEW.planned_target IS NULL THEN
    NEW.planned_target := v_goal.target;
  END IF;

  -- Set entered_at on first real entry
  IF NEW.actual_achievement IS NOT NULL AND NEW.entered_at IS NULL THEN
    NEW.entered_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_compute_score
  BEFORE INSERT OR UPDATE ON quarterly_achievements
  FOR EACH ROW EXECUTE FUNCTION trigger_compute_score();

-- =============================================================
-- 4. SHARED GOAL ACHIEVEMENT SYNC
-- Fires when primary owner updates their quarterly_achievement.
-- Propagates actual_achievement + status + progress_score to
-- all linked member goals (is_synced_from_primary = true).
-- =============================================================

CREATE OR REPLACE FUNCTION trigger_sync_shared_achievements()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_goal          goals%ROWTYPE;
  v_member        shared_goal_members%ROWTYPE;
  v_member_goal   goals%ROWTYPE;
BEGIN
  -- Only sync if this is a primary owner's goal
  SELECT * INTO v_goal FROM goals WHERE id = NEW.goal_id;
  IF NOT v_goal.is_shared_primary OR v_goal.shared_group_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Iterate over all other members of the group
  FOR v_member IN
    SELECT * FROM shared_goal_members
    WHERE group_id = v_goal.shared_group_id
      AND employee_id <> NEW.employee_id
      AND goal_id IS NOT NULL
  LOOP
    SELECT * INTO v_member_goal FROM goals WHERE id = v_member.goal_id;

    INSERT INTO quarterly_achievements (
      goal_id, employee_id, quarter, cycle_year,
      planned_target, actual_achievement, achievement_notes,
      status, progress_score, is_synced_from_primary,
      entered_by, entered_at
    )
    VALUES (
      v_member.goal_id,
      v_member.employee_id,
      NEW.quarter,
      NEW.cycle_year,
      v_member_goal.target,
      NEW.actual_achievement,
      NEW.achievement_notes,
      NEW.status,
      compute_progress_score(
        v_member_goal.uom_type,
        NEW.actual_achievement,
        v_member_goal.target,
        v_member_goal.target_date
      ),
      TRUE,
      NEW.entered_by,
      NOW()
    )
    ON CONFLICT (goal_id, quarter, cycle_year) DO UPDATE SET
      actual_achievement     = EXCLUDED.actual_achievement,
      achievement_notes      = EXCLUDED.achievement_notes,
      status                 = EXCLUDED.status,
      progress_score         = EXCLUDED.progress_score,
      is_synced_from_primary = TRUE,
      updated_at             = NOW();
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_shared_achievements
  AFTER INSERT OR UPDATE ON quarterly_achievements
  FOR EACH ROW EXECUTE FUNCTION trigger_sync_shared_achievements();

-- =============================================================
-- 5. GOAL COUNT GUARD  (max 8 goals per sheet)
-- =============================================================

CREATE OR REPLACE FUNCTION trigger_check_goal_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM goals WHERE sheet_id = NEW.sheet_id;

  -- On INSERT, current count is before insert (check ≥ 8)
  IF TG_OP = 'INSERT' AND v_count >= 8 THEN
    RAISE EXCEPTION 'GOAL_LIMIT_EXCEEDED: A goal sheet cannot have more than 8 goals.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_goal_count
  BEFORE INSERT ON goals
  FOR EACH ROW EXECUTE FUNCTION trigger_check_goal_count();

-- =============================================================
-- 6. WEIGHTAGE VALIDATION ON SUBMISSION
-- Total weightage must equal exactly 100 when status → submitted.
-- =============================================================

CREATE OR REPLACE FUNCTION trigger_validate_weightage_on_submit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  -- Only fire when status transitions to 'submitted'
  IF NEW.status = 'submitted' AND
     (OLD.status IS DISTINCT FROM 'submitted') THEN

    SELECT COALESCE(SUM(weightage), 0)
    INTO v_total
    FROM goals
    WHERE sheet_id = NEW.id;

    IF v_total <> 100 THEN
      RAISE EXCEPTION 'WEIGHTAGE_INVALID: Total weightage is % but must equal exactly 100.', v_total;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_weightage
  BEFORE UPDATE ON goal_sheets
  FOR EACH ROW EXECUTE FUNCTION trigger_validate_weightage_on_submit();

-- =============================================================
-- 7. GOAL LOCKING  (auto-lock sheet when approved)
-- =============================================================

CREATE OR REPLACE FUNCTION trigger_lock_on_approval()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    NEW.is_locked    := TRUE;
    NEW.approved_at  := NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_lock_on_approval
  BEFORE UPDATE ON goal_sheets
  FOR EACH ROW EXECUTE FUNCTION trigger_lock_on_approval();

-- =============================================================
-- 8. AUDIT LOG TRIGGERS
-- Captures changes on goal_sheets, goals, quarterly_achievements.
-- Stores old_values + new_values as JSONB.
-- =============================================================

CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_old  JSONB := NULL;
  v_new  JSONB := NULL;
  v_user UUID;
BEGIN
  -- Attempt to get current user from custom session variable (set by app)
  BEGIN
    v_user := current_setting('app.current_user_id', TRUE)::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
  ELSE
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_logs (
    table_name, record_id, action,
    changed_by, changed_at,
    old_values, new_values
  )
  VALUES (
    TG_TABLE_NAME,
    CASE TG_OP WHEN 'DELETE' THEN (v_old->>'id')::UUID ELSE (v_new->>'id')::UUID END,
    TG_OP::audit_action,
    v_user,
    NOW(),
    v_old,
    v_new
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers
CREATE TRIGGER trg_audit_goal_sheets
  AFTER INSERT OR UPDATE OR DELETE ON goal_sheets
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trg_audit_goals
  AFTER INSERT OR UPDATE OR DELETE ON goals
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trg_audit_qa
  AFTER INSERT OR UPDATE OR DELETE ON quarterly_achievements
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- =============================================================
-- 9. ADMIN UNLOCK FUNCTION (callable via RPC)
-- =============================================================

CREATE OR REPLACE FUNCTION admin_unlock_goal_sheet(
  p_sheet_id    UUID,
  p_admin_id    UUID,
  p_reason      TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE goal_sheets SET
    is_locked    = FALSE,
    status       = 'approved',  -- stays approved but editable
    unlocked_at  = NOW(),
    unlocked_by  = p_admin_id,
    unlock_reason = p_reason
  WHERE id = p_sheet_id;

  -- Explicit audit entry for unlock
  INSERT INTO audit_logs (
    table_name, record_id, action, changed_by, changed_at,
    change_summary, new_values
  )
  VALUES (
    'goal_sheets', p_sheet_id, 'UPDATE', p_admin_id, NOW(),
    'Admin unlocked goal sheet: ' || p_reason,
    jsonb_build_object('is_locked', FALSE, 'unlock_reason', p_reason)
  );
END;
$$;

-- =============================================================
-- 10. NOTIFICATION HELPER (callable from triggers or app code)
-- =============================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id          UUID,
  p_title            TEXT,
  p_message          TEXT,
  p_type             notif_type,
  p_related_sheet_id UUID DEFAULT NULL,
  p_related_goal_id  UUID DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, related_sheet_id, related_goal_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_sheet_id, p_related_goal_id);
END;
$$;

-- =============================================================
-- 11. GET TEAM COMPLETION STATS (for manager/admin dashboard)
-- Returns per-employee completion summary for a given year.
-- =============================================================

CREATE OR REPLACE FUNCTION get_team_completion_stats(p_manager_id UUID, p_cycle_year INT)
RETURNS TABLE (
  employee_id   UUID,
  full_name     TEXT,
  department    TEXT,
  sheet_status  TEXT,
  total_goals   BIGINT,
  avg_score     NUMERIC,
  is_locked     BOOLEAN
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.id                                       AS employee_id,
    p.full_name,
    d.name                                     AS department,
    COALESCE(gs.status::TEXT, 'no_sheet')      AS sheet_status,
    COUNT(g.id)                                AS total_goals,
    ROUND(AVG(qa.progress_score), 1)           AS avg_score,
    COALESCE(gs.is_locked, FALSE)              AS is_locked
  FROM profiles p
  LEFT JOIN departments d         ON d.id = p.department_id
  LEFT JOIN goal_sheets gs        ON gs.employee_id = p.id AND gs.cycle_year = p_cycle_year
  LEFT JOIN goals g               ON g.sheet_id = gs.id
  LEFT JOIN quarterly_achievements qa ON qa.goal_id = g.id
  WHERE p.manager_id = p_manager_id
    AND p.is_active = TRUE
  GROUP BY p.id, p.full_name, d.name, gs.status, gs.is_locked;
$$;
