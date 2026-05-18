/**
 * @file auth.ts
 * @description TypeScript types for users, roles, and auth state
 * @module types
 */

export type UserRole = 'employee' | 'manager' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id: string | null;
  manager_id: string | null;
  employee_code: string | null;
  designation: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  // joined
  department?: Department;
  manager?: Profile;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parent_id: string | null;
  head_id: string | null;
  created_at: string;
}
