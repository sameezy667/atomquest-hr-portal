/**
 * @file achievements.ts
 * @description Quarterly achievement tracking API functions
 * @module lib/api
 */
import { supabase } from '../supabase';
import type { Database } from '../types/database';

type QuarterlyAchievement = Database['public']['Tables']['quarterly_achievements']['Row'];
type AchievementInsert = Database['public']['Tables']['quarterly_achievements']['Insert'];
type AchievementUpdate = Database['public']['Tables']['quarterly_achievements']['Update'];

export interface AchievementWithGoal extends QuarterlyAchievement {
  goal?: {
    id: string;
    title: string;
    thrust_area: string;
    uom_type: string;
    target: number | null;
    target_date: string | null;
    weightage: number;
  };
}

/**
 * Fetch quarterly achievements for an employee
 */
export async function fetchEmployeeAchievements(
  employeeId: string,
  quarter: string,
  cycleYear: number
) {
  const { data, error } = await supabase
    .from('quarterly_achievements')
    .select(`
      *,
      goal:goals (
        id, title, thrust_area, uom_type, target, target_date, weightage
      )
    `)
    .eq('employee_id', employeeId)
    .eq('quarter', quarter)
    .eq('cycle_year', cycleYear)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as AchievementWithGoal[];
}

/**
 * Fetch all achievements for a specific goal
 */
export async function fetchGoalAchievements(goalId: string) {
  const { data, error } = await supabase
    .from('quarterly_achievements')
    .select('*')
    .eq('goal_id', goalId)
    .order('quarter', { ascending: true });

  if (error) throw error;
  return data as QuarterlyAchievement[];
}

/**
 * Create or update quarterly achievement
 */
export async function upsertAchievement(achievementData: AchievementInsert) {
  const { data, error } = await supabase
    .from('quarterly_achievements')
    .upsert(achievementData, {
      onConflict: 'goal_id,quarter,cycle_year',
    })
    .select()
    .single();

  if (error) throw error;
  return data as QuarterlyAchievement;
}

/**
 * Update achievement
 */
export async function updateAchievement(achievementId: string, updates: AchievementUpdate) {
  const { data, error } = await supabase
    .from('quarterly_achievements')
    .update(updates)
    .eq('id', achievementId)
    .select()
    .single();

  if (error) throw error;
  return data as QuarterlyAchievement;
}

/**
 * Fetch team achievements (for manager dashboard)
 */
export async function fetchTeamAchievements(
  managerId: string,
  quarter: string,
  cycleYear: number
) {
  // First get direct reports
  const { data: reports, error: reportsError } = await supabase
    .from('profiles')
    .select('id')
    .eq('manager_id', managerId);

  if (reportsError) throw reportsError;

  const reportIds = reports.map((r) => r.id);

  if (reportIds.length === 0) return [];

  const { data, error } = await supabase
    .from('quarterly_achievements')
    .select(`
      *,
      goal:goals (
        id, title, thrust_area, uom_type, target, target_date, weightage
      ),
      employee:profiles!quarterly_achievements_employee_id_fkey (
        id, full_name, email
      )
    `)
    .in('employee_id', reportIds)
    .eq('quarter', quarter)
    .eq('cycle_year', cycleYear);

  if (error) throw error;
  return data;
}

/**
 * Calculate overall progress for an employee
 */
export async function calculateEmployeeProgress(
  employeeId: string,
  quarter: string,
  cycleYear: number
) {
  const achievements = await fetchEmployeeAchievements(employeeId, quarter, cycleYear);

  if (achievements.length === 0) {
    return {
      totalGoals: 0,
      completedGoals: 0,
      averageScore: 0,
      weightedScore: 0,
    };
  }

  const totalGoals = achievements.length;
  const completedGoals = achievements.filter((a) => a.status === 'completed').length;

  // Calculate weighted average score
  let totalWeightedScore = 0;
  let totalWeight = 0;

  achievements.forEach((achievement) => {
    if (achievement.progress_score !== null && achievement.goal) {
      totalWeightedScore += achievement.progress_score * achievement.goal.weightage;
      totalWeight += achievement.goal.weightage;
    }
  });

  const weightedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const averageScore =
    achievements.reduce((sum, a) => sum + (a.progress_score || 0), 0) / totalGoals;

  return {
    totalGoals,
    completedGoals,
    averageScore: Math.round(averageScore * 10) / 10,
    weightedScore: Math.round(weightedScore * 10) / 10,
  };
}
