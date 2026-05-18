-- =============================================================
-- @file 004_email_notifications.sql
-- @description Email notification triggers and functions
-- @module supabase/migrations
-- =============================================================

-- Function to send email notification via Supabase Edge Function
CREATE OR REPLACE FUNCTION send_email_notification(
  p_to_email TEXT,
  p_subject TEXT,
  p_body TEXT,
  p_notification_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called by triggers to send emails
  -- In production, this would invoke a Supabase Edge Function or external email service
  -- For now, we'll log the email details
  
  RAISE NOTICE 'Email Notification: To=%, Subject=%, Type=%', p_to_email, p_subject, p_notification_type;
  
  -- In production, you would call:
  -- PERFORM net.http_post(
  --   url := 'https://your-project.supabase.co/functions/v1/send-email',
  --   headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('request.jwt.claims')::json->>'sub'),
  --   body := jsonb_build_object('to', p_to_email, 'subject', p_subject, 'body', p_body, 'type', p_notification_type)
  -- );
END;
$$;

-- Trigger function for goal submission email
CREATE OR REPLACE FUNCTION notify_goal_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_employee_name TEXT;
  v_employee_email TEXT;
  v_manager_email TEXT;
  v_manager_name TEXT;
BEGIN
  -- Only send email when status changes to 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    
    -- Get employee details
    SELECT full_name, email INTO v_employee_name, v_employee_email
    FROM profiles
    WHERE id = NEW.employee_id;
    
    -- Get manager details
    SELECT p.email, p.full_name INTO v_manager_email, v_manager_name
    FROM profiles e
    JOIN profiles p ON e.manager_id = p.id
    WHERE e.id = NEW.employee_id;
    
    IF v_manager_email IS NOT NULL THEN
      -- Send email to manager
      PERFORM send_email_notification(
        v_manager_email,
        'New Goal Sheet Submitted for Review - ' || v_employee_name,
        'Hello ' || v_manager_name || ',

' || v_employee_name || ' has submitted their goal sheet for FY' || NEW.cycle_year || ' and it is now awaiting your review.

Please log in to the AtomQuest HR Portal to review and approve the goals.

Best regards,
AtomQuest HR System',
        'submission'
      );
    END IF;
    
    -- Send confirmation email to employee
    PERFORM send_email_notification(
      v_employee_email,
      'Goal Sheet Submitted Successfully',
      'Hello ' || v_employee_name || ',

Your goal sheet for FY' || NEW.cycle_year || ' has been successfully submitted for manager review.

You will receive a notification once your manager has reviewed your goals.

Best regards,
AtomQuest HR System',
      'submission'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for goal approval email
CREATE OR REPLACE FUNCTION notify_goal_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_employee_name TEXT;
  v_employee_email TEXT;
  v_manager_name TEXT;
BEGIN
  -- Only send email when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Get employee details
    SELECT full_name, email INTO v_employee_name, v_employee_email
    FROM profiles
    WHERE id = NEW.employee_id;
    
    -- Get manager name
    SELECT full_name INTO v_manager_name
    FROM profiles
    WHERE id = NEW.approved_by;
    
    -- Send email to employee
    PERFORM send_email_notification(
      v_employee_email,
      'Goal Sheet Approved - ' || v_employee_name,
      'Hello ' || v_employee_name || ',

Great news! Your goal sheet for FY' || NEW.cycle_year || ' has been approved by ' || COALESCE(v_manager_name, 'your manager') || '.

You can now start tracking your quarterly progress in the AtomQuest HR Portal.

Best regards,
AtomQuest HR System',
      'approval'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for goal return email
CREATE OR REPLACE FUNCTION notify_goal_return()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_employee_name TEXT;
  v_employee_email TEXT;
  v_manager_name TEXT;
BEGIN
  -- Only send email when status changes to 'returned'
  IF NEW.status = 'returned' AND (OLD.status IS NULL OR OLD.status != 'returned') THEN
    
    -- Get employee details
    SELECT full_name, email INTO v_employee_name, v_employee_email
    FROM profiles
    WHERE id = NEW.employee_id;
    
    -- Get manager name
    SELECT full_name INTO v_manager_name
    FROM profiles
    WHERE id = NEW.returned_by;
    
    -- Send email to employee
    PERFORM send_email_notification(
      v_employee_email,
      'Goal Sheet Returned for Revision - ' || v_employee_name,
      'Hello ' || v_employee_name || ',

Your goal sheet for FY' || NEW.cycle_year || ' has been returned by ' || COALESCE(v_manager_name, 'your manager') || ' for revision.

Reason: ' || COALESCE(NEW.return_reason, 'No reason provided') || '

Please review the feedback and resubmit your goals.

Best regards,
AtomQuest HR System',
      'return'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for check-in reminder email
CREATE OR REPLACE FUNCTION notify_checkin_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_employee RECORD;
BEGIN
  -- Send email when a goal cycle becomes active (is_active changes to true)
  IF NEW.is_active = TRUE AND (OLD.is_active IS NULL OR OLD.is_active = FALSE) THEN
    
    -- Send reminder to all employees with approved goal sheets
    FOR v_employee IN
      SELECT DISTINCT p.id, p.full_name, p.email, gs.cycle_year
      FROM profiles p
      JOIN goal_sheets gs ON gs.employee_id = p.id
      WHERE gs.status = 'approved'
        AND gs.cycle_year = NEW.cycle_year
        AND p.is_active = TRUE
    LOOP
      PERFORM send_email_notification(
        v_employee.email,
        'Quarterly Check-in Window Now Open - ' || NEW.name,
        'Hello ' || v_employee.full_name || ',

The check-in window for ' || NEW.name || ' is now open!

Period: ' || TO_CHAR(NEW.start_date, 'Mon DD, YYYY') || ' - ' || TO_CHAR(NEW.end_date, 'Mon DD, YYYY') || '

Please log in to the AtomQuest HR Portal to update your quarterly progress and achievements.

Best regards,
AtomQuest HR System',
        'checkin'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for shared goal assignment email
CREATE OR REPLACE FUNCTION notify_shared_goal_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_employee_name TEXT;
  v_employee_email TEXT;
  v_group_title TEXT;
  v_creator_name TEXT;
BEGIN
  -- Get employee details
  SELECT full_name, email INTO v_employee_name, v_employee_email
  FROM profiles
  WHERE id = NEW.employee_id;
  
  -- Get shared goal group details
  SELECT sgg.title, p.full_name INTO v_group_title, v_creator_name
  FROM shared_goal_groups sgg
  JOIN profiles p ON sgg.created_by = p.id
  WHERE sgg.id = NEW.group_id;
  
  -- Send email to employee
  PERFORM send_email_notification(
    v_employee_email,
    'You Have Been Added to a Shared Goal - ' || v_group_title,
    'Hello ' || v_employee_name || ',

You have been added to a shared goal: "' || v_group_title || '" by ' || v_creator_name || '.

' || CASE WHEN NEW.is_primary THEN 'You are the primary owner of this goal and responsible for tracking progress.' ELSE 'This goal has been cascaded to you as part of team objectives.' END || '

Please log in to the AtomQuest HR Portal to view the goal details.

Best regards,
AtomQuest HR System',
    'shared_goal'
  );
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_goal_submission_email ON goal_sheets;
CREATE TRIGGER trigger_goal_submission_email
  AFTER UPDATE ON goal_sheets
  FOR EACH ROW
  EXECUTE FUNCTION notify_goal_submission();

DROP TRIGGER IF EXISTS trigger_goal_approval_email ON goal_sheets;
CREATE TRIGGER trigger_goal_approval_email
  AFTER UPDATE ON goal_sheets
  FOR EACH ROW
  EXECUTE FUNCTION notify_goal_approval();

DROP TRIGGER IF EXISTS trigger_goal_return_email ON goal_sheets;
CREATE TRIGGER trigger_goal_return_email
  AFTER UPDATE ON goal_sheets
  FOR EACH ROW
  EXECUTE FUNCTION notify_goal_return();

DROP TRIGGER IF EXISTS trigger_checkin_reminder_email ON goal_cycles;
CREATE TRIGGER trigger_checkin_reminder_email
  AFTER UPDATE ON goal_cycles
  FOR EACH ROW
  EXECUTE FUNCTION notify_checkin_reminder();

DROP TRIGGER IF EXISTS trigger_shared_goal_assignment_email ON shared_goal_members;
CREATE TRIGGER trigger_shared_goal_assignment_email
  AFTER INSERT ON shared_goal_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_shared_goal_assignment();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_email_notification TO authenticated;
GRANT EXECUTE ON FUNCTION notify_goal_submission TO authenticated;
GRANT EXECUTE ON FUNCTION notify_goal_approval TO authenticated;
GRANT EXECUTE ON FUNCTION notify_goal_return TO authenticated;
GRANT EXECUTE ON FUNCTION notify_checkin_reminder TO authenticated;
GRANT EXECUTE ON FUNCTION notify_shared_goal_assignment TO authenticated;
