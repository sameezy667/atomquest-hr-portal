-- =============================================================
-- @file 001_schema.sql
-- @description Full normalized schema for AtomQuest HR Portal
-- @module supabase/migrations
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- ENUMS
-- =============================================================

CREATE TYPE user_role       AS ENUM ('employee', 'manager', 'admin');
CREATE TYPE goal_status     AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'returned');
CREATE TYPE uom_type        AS ENUM ('min', 'max', 'timeline', 'zero_based');
CREATE TYPE cycle_type      AS ENUM ('goal_setting', 'q1', 'q2', 'q3', 'q4_annual');
CREATE TYPE achieve_status  AS ENUM ('not_started', 'on_track', 'completed');
CREATE TYPE rating_type     AS ENUM ('exceeds', 'meets', 'below', 'critical');
CREATE TYPE audit_action    AS ENUM ('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE notif_type      AS ENUM ('submission','approval','return','checkin','shared_goal','unlock','system');

-- =============================================================
-- DEPARTMENTS
-- =============================================================

CREATE TABLE departments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  code       TEXT        NOT NULL UNIQUE,
  parent_id  UUID        REFERENCES departments(id) ON DELETE SET NULL,
  head_id    UUID,       -- FK to profiles added after profiles table creation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- PROFILES  (extends auth.users)
-- =============================================================

CREATE TABLE profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL UNIQUE,
  full_name     TEXT        NOT NULL,
  role          user_role   NOT NULL DEFAULT 'employee',
  department_id UUID        REFERENCES departments(id) ON DELETE SET NULL,
  manager_id    UUID        REFERENCES profiles(id)   ON DELETE SET NULL,
  employee_code TEXT        UNIQUE,
  designation   TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deferred FK: department head
ALTER TABLE departments
  ADD CONSTRAINT fk_dept_head
  FOREIGN KEY (head_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================================
-- GOAL CYCLES
-- =============================================================

CREATE TABLE goal_cycles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  cycle_year  INT         NOT NULL,
  cycle_type  cycle_type  NOT NULL,
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_by  UUID        REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  UNIQUE (cycle_year, cycle_type)
);

-- =============================================================
-- GOAL SHEETS  (one per employee per year)
-- =============================================================

CREATE TABLE goal_sheets (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cycle_year      INT         NOT NULL,
  status          goal_status NOT NULL DEFAULT 'draft',
  is_locked       BOOLEAN     NOT NULL DEFAULT FALSE,

  submitted_at    TIMESTAMPTZ,
  approved_at     TIMESTAMPTZ,
  approved_by     UUID        REFERENCES profiles(id),
  returned_at     TIMESTAMPTZ,
  returned_by     UUID        REFERENCES profiles(id),
  return_reason   TEXT,

  unlocked_at     TIMESTAMPTZ,
  unlocked_by     UUID        REFERENCES profiles(id),
  unlock_reason   TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (employee_id, cycle_year)
);

-- =============================================================
-- SHARED GOAL GROUPS  (template pushed by admin/manager)
-- =============================================================

CREATE TABLE shared_goal_groups (
  id            UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT       NOT NULL,
  description   TEXT,
  thrust_area   TEXT       NOT NULL,
  uom_type      uom_type   NOT NULL,
  target        NUMERIC,
  target_date   DATE,
  cycle_year    INT        NOT NULL,
  department_id UUID       REFERENCES departments(id),
  created_by    UUID       NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- GOALS  (rows within a goal sheet)
-- =============================================================

CREATE TABLE goals (
  id                UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id          UUID      NOT NULL REFERENCES goal_sheets(id)       ON DELETE CASCADE,
  employee_id       UUID      NOT NULL REFERENCES profiles(id),

  -- Shared goal linkage (NULL for non-shared goals)
  shared_group_id   UUID      REFERENCES shared_goal_groups(id)          ON DELETE SET NULL,
  is_shared_primary BOOLEAN   NOT NULL DEFAULT FALSE,

  thrust_area       TEXT      NOT NULL,
  title             TEXT      NOT NULL,
  description       TEXT,
  uom_type          uom_type  NOT NULL,
  target            NUMERIC,
  target_date       DATE,
  weightage         NUMERIC   NOT NULL,
  display_order     INT       NOT NULL DEFAULT 0,

  -- Read-only flags for shared goal recipients
  is_title_readonly  BOOLEAN  NOT NULL DEFAULT FALSE,
  is_target_readonly BOOLEAN  NOT NULL DEFAULT FALSE,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT weightage_min CHECK (weightage >= 10),
  CONSTRAINT weightage_max CHECK (weightage <= 100)
);

CREATE INDEX idx_goals_sheet_id       ON goals(sheet_id);
CREATE INDEX idx_goals_employee_id    ON goals(employee_id);
CREATE INDEX idx_goals_shared_group   ON goals(shared_group_id);

-- =============================================================
-- SHARED GOAL MEMBERS  (links employees to a shared group)
-- =============================================================

CREATE TABLE shared_goal_members (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID    NOT NULL REFERENCES shared_goal_groups(id) ON DELETE CASCADE,
  employee_id UUID    NOT NULL REFERENCES profiles(id),
  goal_id     UUID    REFERENCES goals(id) ON DELETE SET NULL,   -- goal row in their sheet
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  weightage   NUMERIC NOT NULL DEFAULT 10,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (group_id, employee_id),
  CONSTRAINT member_weightage_min CHECK (weightage >= 10)
);

-- =============================================================
-- QUARTERLY ACHIEVEMENTS
-- =============================================================

CREATE TABLE quarterly_achievements (
  id                      UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id                 UUID           NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  employee_id             UUID           NOT NULL REFERENCES profiles(id),
  quarter                 TEXT           NOT NULL CHECK (quarter IN ('q1','q2','q3','q4')),
  cycle_year              INT            NOT NULL,

  planned_target          NUMERIC,       -- snapshot of goals.target at first entry
  actual_achievement      NUMERIC,
  achievement_notes       TEXT,

  status                  achieve_status NOT NULL DEFAULT 'not_started',
  progress_score          NUMERIC,       -- computed by trigger

  is_synced_from_primary  BOOLEAN        NOT NULL DEFAULT FALSE,

  entered_by              UUID           REFERENCES profiles(id),
  entered_at              TIMESTAMPTZ,
  updated_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  UNIQUE (goal_id, quarter, cycle_year)
);

CREATE INDEX idx_qa_goal_id      ON quarterly_achievements(goal_id);
CREATE INDEX idx_qa_employee_id  ON quarterly_achievements(employee_id);
CREATE INDEX idx_qa_quarter_year ON quarterly_achievements(quarter, cycle_year);

-- =============================================================
-- MANAGER CHECK-INS
-- =============================================================

CREATE TABLE manager_checkins (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id       UUID         NOT NULL REFERENCES goal_sheets(id) ON DELETE CASCADE,
  manager_id     UUID         NOT NULL REFERENCES profiles(id),
  employee_id    UUID         NOT NULL REFERENCES profiles(id),
  quarter        TEXT         NOT NULL CHECK (quarter IN ('q1','q2','q3','q4')),
  cycle_year     INT          NOT NULL,
  comment        TEXT         NOT NULL,
  overall_rating rating_type,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkins_sheet   ON manager_checkins(sheet_id);
CREATE INDEX idx_checkins_manager ON manager_checkins(manager_id);

-- =============================================================
-- AUDIT LOGS  (immutable append-only)
-- =============================================================

CREATE TABLE audit_logs (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name      TEXT         NOT NULL,
  record_id       UUID         NOT NULL,
  action          audit_action NOT NULL,
  changed_by      UUID         REFERENCES profiles(id),
  changed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  old_values      JSONB,
  new_values      JSONB,
  change_summary  TEXT,
  session_context JSONB
);

CREATE INDEX idx_audit_record     ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_changed_at ON audit_logs(changed_at DESC);

-- =============================================================
-- NOTIFICATIONS
-- =============================================================

CREATE TABLE notifications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  message          TEXT,
  type             notif_type  NOT NULL DEFAULT 'system',
  is_read          BOOLEAN     NOT NULL DEFAULT FALSE,
  related_sheet_id UUID        REFERENCES goal_sheets(id) ON DELETE SET NULL,
  related_goal_id  UUID        REFERENCES goals(id)       ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);
