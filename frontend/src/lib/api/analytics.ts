/**
 * @file analytics.ts
 * @description Analytics and reporting API functions
 * @module lib/api
 */
import { supabase } from '../supabase';

export interface DepartmentStats {
  department_id: string;
  department_name: string;
  total_employees: number;
  submitted_count: number;
  approved_count: number;
  avg_progress: number;
}

export interface TeamCompletionStats {
  employee_id: string;
  full_name: string;
  department: string;
  sheet_status: string;
  total_goals: number;
  avg_score: number;
  is_locked: boolean;
}

/**
 * Get department-wise statistics
 */
export async function getDepartmentStats(cycleYear: number): Promise<DepartmentStats[]> {
  const { data, error } = await supabase.rpc('get_department_stats', {
    p_cycle_year: cycleYear,
  });

  if (error) {
    // Fallback if RPC doesn't exist - manual aggregation
    const { data: sheets, error: sheetsError } = await supabase
      .from('goal_sheets')
      .select(`
        *,
        employee:profiles!goal_sheets_employee_id_fkey (
          department:departments!profiles_department_id_fkey (id, name)
        )
      `)
      .eq('cycle_year', cycleYear);

    if (sheetsError) throw sheetsError;

    // Manual aggregation
    const deptMap = new Map<string, DepartmentStats>();

    sheets?.forEach((sheet: any) => {
      const deptId = sheet.employee?.department?.id;
      const deptName = sheet.employee?.department?.name || 'Unknown';

      if (!deptId) return;

      if (!deptMap.has(deptId)) {
        deptMap.set(deptId, {
          department_id: deptId,
          department_name: deptName,
          total_employees: 0,
          submitted_count: 0,
          approved_count: 0,
          avg_progress: 0,
        });
      }

      const stats = deptMap.get(deptId)!;
      stats.total_employees++;
      if (sheet.status === 'submitted' || sheet.status === 'approved') {
        stats.submitted_count++;
      }
      if (sheet.status === 'approved') {
        stats.approved_count++;
      }
    });

    return Array.from(deptMap.values());
  }

  return data as DepartmentStats[];
}

/**
 * Get team completion statistics (for managers)
 */
export async function getTeamCompletionStats(
  managerId: string,
  cycleYear: number
): Promise<TeamCompletionStats[]> {
  const { data, error } = await supabase.rpc('get_team_completion_stats', {
    p_manager_id: managerId,
    p_cycle_year: cycleYear,
  });

  if (error) throw error;
  return data as TeamCompletionStats[];
}

/**
 * Get organization-wide metrics
 */
export async function getOrganizationMetrics(cycleYear: number) {
  const { data: sheets, error } = await supabase
    .from('goal_sheets')
    .select('status, is_locked')
    .eq('cycle_year', cycleYear);

  if (error) throw error;

  const total = sheets.length;
  const submitted = sheets.filter(
    (s) => s.status === 'submitted' || s.status === 'approved'
  ).length;
  const approved = sheets.filter((s) => s.status === 'approved').length;
  const locked = sheets.filter((s) => s.is_locked).length;

  return {
    totalEmployees: total,
    submissionRate: total > 0 ? Math.round((submitted / total) * 100) : 0,
    approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    lockedSheets: locked,
  };
}

/**
 * Get goal distribution by thrust area
 */
export async function getGoalDistribution(cycleYear: number) {
  const { data, error } = await supabase
    .from('goals')
    .select(`
      thrust_area,
      weightage,
      sheet_id,
      goal_sheets!inner (cycle_year)
    `)
    .eq('goal_sheets.cycle_year', cycleYear);

  if (error) throw error;

  // Aggregate by thrust area
  const distribution = new Map<string, number>();

  data?.forEach((goal: any) => {
    const area = goal.thrust_area || 'Other';
    distribution.set(area, (distribution.get(area) || 0) + 1);
  });

  return Array.from(distribution.entries()).map(([name, value]) => ({
    name,
    value,
  }));
}

/**
 * Get progress trend over time (weekly/monthly)
 */
export async function getProgressTrend(employeeId: string, cycleYear: number) {
  const { data, error } = await supabase
    .from('quarterly_achievements')
    .select('quarter, progress_score, updated_at')
    .eq('employee_id', employeeId)
    .eq('cycle_year', cycleYear)
    .order('updated_at', { ascending: true });

  if (error) throw error;
  return data;
}
