/**
 * @file database.ts
 * @description TypeScript types generated from Supabase schema
 * @module lib/types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'employee' | 'manager' | 'admin'
          department_id: string | null
          manager_id: string | null
          employee_code: string | null
          designation: string | null
          is_active: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'employee' | 'manager' | 'admin'
          department_id?: string | null
          manager_id?: string | null
          employee_code?: string | null
          designation?: string | null
          is_active?: boolean
          avatar_url?: string | null
        }
        Update: {
          email?: string
          full_name?: string
          role?: 'employee' | 'manager' | 'admin'
          department_id?: string | null
          manager_id?: string | null
          employee_code?: string | null
          designation?: string | null
          is_active?: boolean
          avatar_url?: string | null
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          parent_id: string | null
          head_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          parent_id?: string | null
          head_id?: string | null
        }
        Update: {
          name?: string
          code?: string
          parent_id?: string | null
          head_id?: string | null
        }
      }
      goal_sheets: {
        Row: {
          id: string
          employee_id: string
          cycle_year: number
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'returned'
          is_locked: boolean
          submitted_at: string | null
          approved_at: string | null
          approved_by: string | null
          returned_at: string | null
          returned_by: string | null
          return_reason: string | null
          unlocked_at: string | null
          unlocked_by: string | null
          unlock_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          cycle_year: number
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'returned'
          is_locked?: boolean
          submitted_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          returned_at?: string | null
          returned_by?: string | null
          return_reason?: string | null
        }
        Update: {
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'returned'
          is_locked?: boolean
          submitted_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          returned_at?: string | null
          returned_by?: string | null
          return_reason?: string | null
          unlocked_at?: string | null
          unlocked_by?: string | null
          unlock_reason?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          sheet_id: string
          employee_id: string
          shared_group_id: string | null
          is_shared_primary: boolean
          thrust_area: string
          title: string
          description: string | null
          uom_type: 'min' | 'max' | 'timeline' | 'zero_based'
          target: number | null
          target_date: string | null
          weightage: number
          display_order: number
          is_title_readonly: boolean
          is_target_readonly: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sheet_id: string
          employee_id: string
          shared_group_id?: string | null
          is_shared_primary?: boolean
          thrust_area: string
          title: string
          description?: string | null
          uom_type: 'min' | 'max' | 'timeline' | 'zero_based'
          target?: number | null
          target_date?: string | null
          weightage: number
          display_order?: number
          is_title_readonly?: boolean
          is_target_readonly?: boolean
        }
        Update: {
          thrust_area?: string
          title?: string
          description?: string | null
          uom_type?: 'min' | 'max' | 'timeline' | 'zero_based'
          target?: number | null
          target_date?: string | null
          weightage?: number
          display_order?: number
        }
      }
      quarterly_achievements: {
        Row: {
          id: string
          goal_id: string
          employee_id: string
          quarter: string
          cycle_year: number
          planned_target: number | null
          actual_achievement: number | null
          achievement_notes: string | null
          status: 'not_started' | 'on_track' | 'completed'
          progress_score: number | null
          is_synced_from_primary: boolean
          entered_by: string | null
          entered_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          employee_id: string
          quarter: string
          cycle_year: number
          planned_target?: number | null
          actual_achievement?: number | null
          achievement_notes?: string | null
          status?: 'not_started' | 'on_track' | 'completed'
          progress_score?: number | null
          is_synced_from_primary?: boolean
          entered_by?: string | null
          entered_at?: string | null
        }
        Update: {
          actual_achievement?: number | null
          achievement_notes?: string | null
          status?: 'not_started' | 'on_track' | 'completed'
          progress_score?: number | null
        }
      }
      shared_goal_groups: {
        Row: {
          id: string
          title: string
          description: string | null
          thrust_area: string
          uom_type: 'min' | 'max' | 'timeline' | 'zero_based'
          target: number | null
          target_date: string | null
          cycle_year: number
          department_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thrust_area: string
          uom_type: 'min' | 'max' | 'timeline' | 'zero_based'
          target?: number | null
          target_date?: string | null
          cycle_year: number
          department_id?: string | null
          created_by: string
        }
        Update: {
          title?: string
          description?: string | null
          thrust_area?: string
          uom_type?: 'min' | 'max' | 'timeline' | 'zero_based'
          target?: number | null
          target_date?: string | null
        }
      }
      shared_goal_members: {
        Row: {
          id: string
          group_id: string
          employee_id: string
          goal_id: string | null
          is_primary: boolean
          weightage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          employee_id: string
          goal_id?: string | null
          is_primary?: boolean
          weightage?: number
        }
        Update: {
          weightage?: number
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          type: 'submission' | 'approval' | 'return' | 'checkin' | 'shared_goal' | 'unlock' | 'system'
          is_read: boolean
          related_sheet_id: string | null
          related_goal_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message?: string | null
          type?: 'submission' | 'approval' | 'return' | 'checkin' | 'shared_goal' | 'unlock' | 'system'
          is_read?: boolean
          related_sheet_id?: string | null
          related_goal_id?: string | null
        }
        Update: {
          is_read?: boolean
        }
      }
    }
  }
}
