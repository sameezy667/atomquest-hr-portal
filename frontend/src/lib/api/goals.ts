/**
 * @file goals.ts
 * @description Goal management API functions
 * @module lib/api
 */
import { supabase } from '../supabase';
import type { Database } from '../types/database';

type GoalSheet = Database['public']['Tables']['goal_sheets']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export interface GoalWithDetails extends Goal {
  goal_sheets?: GoalSheet;
}

export interface GoalSheetWithGoals extends GoalSheet {
  goals?: Goal[];
  employee?: {
    id: string;
    full_name: string;
    email: string;
    department?: {
      name: string;
    };
  };
}

/**
 * Fetch goal sheet for an employee in a specific cycle year
 */
export async function fetchGoalSheet(employeeId: string, cycleYear: number) {
  const { data, error } = await supabase
    .from('goal_sheets')
    .select(`
      *,
      goals (*),
      employee:profiles!goal_sheets_employee_id_fkey (
        id, full_name, email,
        department:departments!profiles_department_id_fkey (name)
      )
    `)
    .eq('employee_id', employeeId)
    .eq('cycle_year', cycleYear)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data as GoalSheetWithGoals | null;
}

/**
 * Create a new goal sheet for an employee
 */
export async function createGoalSheet(employeeId: string, cycleYear: number) {
  const { data, error } = await supabase
    .from('goal_sheets')
    .insert({
      employee_id: employeeId,
      cycle_year: cycleYear,
      status: 'draft',
      is_locked: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as GoalSheet;
}

/**
 * Fetch all goals for a goal sheet
 */
export async function fetchGoals(sheetId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('sheet_id', sheetId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Goal[];
}

/**
 * Create a new goal
 */
export async function createGoal(goalData: GoalInsert) {
  const { data, error } = await supabase
    .from('goals')
    .insert(goalData)
    .select()
    .single();

  if (error) throw error;
  return data as Goal;
}

/**
 * Update an existing goal
 */
export async function updateGoal(goalId: string, updates: GoalUpdate) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw error;
  return data as Goal;
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) throw error;
}

/**
 * Submit goal sheet for approval
 */
export async function submitGoalSheet(sheetId: string) {
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', sheetId)
    .select()
    .single();

  if (error) throw error;
  return data as GoalSheet;
}

/**
 * Approve goal sheet (manager action)
 */
export async function approveGoalSheet(sheetId: string, managerId: string) {
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: managerId,
    })
    .eq('id', sheetId)
    .select()
    .single();

  if (error) throw error;
  return data as GoalSheet;
}

/**
 * Return goal sheet to employee (manager action)
 */
export async function returnGoalSheet(sheetId: string, managerId: string, reason: string) {
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({
      status: 'returned',
      returned_at: new Date().toISOString(),
      returned_by: managerId,
      return_reason: reason,
    })
    .eq('id', sheetId)
    .select()
    .single();

  if (error) throw error;
  return data as GoalSheet;
}

/**
 * Fetch all goal sheets for a manager's direct reports
 */
export async function fetchTeamGoalSheets(managerId: string, cycleYear?: number) {
  let query = supabase
    .from('goal_sheets')
    .select(`
      *,
      goals (*),
      employee:profiles!goal_sheets_employee_id_fkey (
        id, full_name, email, designation,
        department:departments!profiles_department_id_fkey (name)
      )
    `)
    .eq('employee.manager_id', managerId);

  if (cycleYear) {
    query = query.eq('cycle_year', cycleYear);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) throw error;
  return data as GoalSheetWithGoals[];
}

/**
 * Fetch pending reviews for a manager
 */
export async function fetchPendingReviews(managerId: string) {
  const { data, error } = await supabase
    .from('goal_sheets')
    .select(`
      *,
      goals (*),
      employee:profiles!goal_sheets_employee_id_fkey (
        id, full_name, email, designation,
        department:departments!profiles_department_id_fkey (name)
      )
    `)
    .eq('employee.manager_id', managerId)
    .in('status', ['submitted', 'under_review'])
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  return data as GoalSheetWithGoals[];
}

/**
 * Update goal sheet status to under_review
 */
export async function markSheetUnderReview(sheetId: string) {
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({ status: 'under_review' })
    .eq('id', sheetId)
    .select()
    .single();

  if (error) throw error;
  return data as GoalSheet;
}

/**
 * Fetch all goal sheets (admin)
 */
export async function fetchAllGoalSheets(filters?: {
  status?: string;
  department_id?: string;
  cycle_year?: number;
}) {
  let query = supabase
    .from('goal_sheets')
    .select(`
      *,
      goals (*),
      employee:profiles!goal_sheets_employee_id_fkey (
        id, full_name, email, designation,
        department:departments!profiles_department_id_fkey (id, name)
      )
    `);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.cycle_year) {
    query = query.eq('cycle_year', filters.cycle_year);
  }
  if (filters?.department_id) {
    query = query.eq('employee.department_id', filters.department_id);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) throw error;
  return data as GoalSheetWithGoals[];
}

/**
 * Unlock goal sheet (admin only)
 */
export async function unlockGoalSheet(sheetId: string, adminId: string, reason: string) {
  const { data, error } = await supabase.rpc('admin_unlock_goal_sheet', {
    p_sheet_id: sheetId,
    p_admin_id: adminId,
    p_reason: reason,
  });

  if (error) throw error;
  return data;
}
