/**
 * @file sharedGoals.ts
 * @description Shared goal management API functions
 * @module lib/api
 */
import { supabase } from '../supabase';
import type { Database } from '../types/database';

type SharedGoalGroup = Database['public']['Tables']['shared_goal_groups']['Row'];
type SharedGoalMember = Database['public']['Tables']['shared_goal_members']['Row'];
type SharedGoalGroupInsert = Database['public']['Tables']['shared_goal_groups']['Insert'];

export interface SharedGoalGroupWithMembers extends SharedGoalGroup {
  members?: Array<
    SharedGoalMember & {
      employee?: {
        id: string;
        full_name: string;
        email: string;
        designation: string | null;
      };
      goal?: {
        id: string;
        title: string;
      };
    }
  >;
  creator?: {
    id: string;
    full_name: string;
  };
}

/**
 * Create a new shared goal group
 */
export async function createSharedGoalGroup(groupData: SharedGoalGroupInsert) {
  const { data, error } = await supabase
    .from('shared_goal_groups')
    .insert(groupData)
    .select()
    .single();

  if (error) throw error;
  return data as SharedGoalGroup;
}

/**
 * Assign employees to a shared goal group
 */
export async function assignSharedGoalMembers(
  groupId: string,
  members: Array<{
    employee_id: string;
    is_primary: boolean;
    weightage: number;
  }>
) {
  const memberInserts = members.map((m) => ({
    group_id: groupId,
    employee_id: m.employee_id,
    is_primary: m.is_primary,
    weightage: m.weightage,
  }));

  const { data, error } = await supabase
    .from('shared_goal_members')
    .insert(memberInserts)
    .select();

  if (error) throw error;
  return data as SharedGoalMember[];
}

/**
 * Fetch all shared goal groups
 */
export async function fetchSharedGoalGroups(filters?: {
  cycle_year?: number;
  department_id?: string;
  created_by?: string;
}) {
  let query = supabase
    .from('shared_goal_groups')
    .select(`
      *,
      members:shared_goal_members (
        *,
        employee:profiles!shared_goal_members_employee_id_fkey (
          id, full_name, email, designation
        ),
        goal:goals (id, title)
      ),
      creator:profiles!shared_goal_groups_created_by_fkey (
        id, full_name
      )
    `);

  if (filters?.cycle_year) {
    query = query.eq('cycle_year', filters.cycle_year);
  }
  if (filters?.department_id) {
    query = query.eq('department_id', filters.department_id);
  }
  if (filters?.created_by) {
    query = query.eq('created_by', filters.created_by);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as SharedGoalGroupWithMembers[];
}

/**
 * Fetch shared goals for a specific employee
 */
export async function fetchEmployeeSharedGoals(employeeId: string, cycleYear?: number) {
  let query = supabase
    .from('shared_goal_members')
    .select(`
      *,
      group:shared_goal_groups!shared_goal_members_group_id_fkey (
        *,
        creator:profiles!shared_goal_groups_created_by_fkey (
          id, full_name
        )
      ),
      goal:goals (id, title, weightage, sheet_id)
    `)
    .eq('employee_id', employeeId);

  if (cycleYear) {
    query = query.eq('group.cycle_year', cycleYear);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Update shared goal member weightage
 */
export async function updateMemberWeightage(memberId: string, weightage: number) {
  const { data, error } = await supabase
    .from('shared_goal_members')
    .update({ weightage })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data as SharedGoalMember;
}

/**
 * Remove employee from shared goal group
 */
export async function removeSharedGoalMember(memberId: string) {
  const { error } = await supabase
    .from('shared_goal_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

/**
 * Delete shared goal group
 */
export async function deleteSharedGoalGroup(groupId: string) {
  const { error } = await supabase
    .from('shared_goal_groups')
    .delete()
    .eq('id', groupId);

  if (error) throw error;
}
