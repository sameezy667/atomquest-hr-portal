/**
 * @file App.tsx
 * @description Main application component with auto-profile creation
 * @version 1.1.0 - Fixed infinite loading issue with auto-profile creation
 */
import { useEffect, useState, useRef } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { GoalEditor } from './pages/GoalEditor';
import { GoalReview } from './pages/GoalReview';
import { Analytics } from './pages/Analytics';
import { CheckIns } from './pages/CheckIns';
import { SharedGoals } from './pages/SharedGoals';
import { Settings } from './pages/Settings';
import { AdminGoals } from './pages/AdminGoals';
import { AdminReports } from './pages/AdminReports';
import { LottieIcon } from './components/ui/LottieIcon';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import type { UserRole } from './types/auth';

export type Role = UserRole;
export type View = 'dashboard' | 'goals' | 'check-ins' | 'shared-goals' | 'reports' | 'analytics' | 'audit' | 'settings' | 'goal-editor' | 'goal-review';

export default function App() {
  const { session, profile, setSession, setProfile, clearAuth, effectiveRole } = useAuthStore();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // Initialize session from storage
    const initAuth = async () => {
      try {
        console.log('🔄 Starting auth initialization...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Auth error:', error);
          setConnectionError(true);
          setLoading(false);
          return;
        }
        
        console.log('✅ Auth check complete:', session ? 'Session found' : 'No session');
        
        setSession(session);
        if (session?.user) {
          console.log('👤 Fetching profile for user:', session.user.id);
          await fetchProfile(session.user.id);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
        if (mounted) {
          setConnectionError(true);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('🔄 Auth state changed:', _event);
        if (!mounted) return;
        
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          clearAuth();
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      console.log('📥 Fetching profile for user:', userId);
      
      // First, try to get the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, designation, department_id')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles
      
      if (error) {
        console.error('❌ Profile fetch error:', error);
        await supabase.auth.signOut();
        clearAuth();
        setLoading(false);
        return;
      }
      
      // If profile doesn't exist, create it
      if (!data) {
        console.log('⚠️ Profile not found, creating new profile...');
        
        // Get user email from auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.email) {
          console.error('❌ Cannot create profile: no email found');
          await supabase.auth.signOut();
          clearAuth();
          setLoading(false);
          return;
        }
        
        // Create new profile with default values
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email,
            full_name: user.email.split('@')[0], // Use email prefix as default name
            role: 'employee', // Default role
            designation: 'Employee',
            department_id: null
          })
          .select('id, full_name, email, role, designation, department_id')
          .single();
        
        if (insertError) {
          console.error('❌ Failed to create profile:', insertError);
          await supabase.auth.signOut();
          clearAuth();
          setLoading(false);
          return;
        }
        
        console.log('✅ Profile created:', newProfile.full_name);
        setProfile(newProfile as any);
        setLoading(false);
        return;
      }
      
      console.log('✅ Profile loaded:', data.full_name);
      setProfile(data as any);
      setLoading(false);
    } catch (error: any) {
      console.error('❌ Failed to fetch profile:', error);
      await supabase.auth.signOut();
      clearAuth();
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LottieIcon name="loading" className="w-32 h-32 mx-auto" />
          <p className="mt-4 text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Connection Error</h2>
          <p className="text-gray-600 mb-6">
            Unable to connect to Supabase or invalid session detected.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Clear Session & Retry
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Retry Connection
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Check the console for detailed error messages
          </p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return <Login />;
  }

  const role = effectiveRole() || 'employee';

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        if (role === 'employee') return <EmployeeDashboard onViewChange={setCurrentView} />;
        if (role === 'manager') return <ManagerDashboard onViewChange={setCurrentView} />;
        if (role === 'admin') return <AdminDashboard onViewChange={setCurrentView} />;
        break;
      case 'goal-editor':
        return <GoalEditor onViewChange={setCurrentView} />;
      case 'goal-review':
        return <GoalReview onViewChange={setCurrentView} />;
      case 'analytics':
        return <Analytics onViewChange={setCurrentView} />;
      case 'check-ins':
        return <CheckIns onViewChange={setCurrentView} />;
      case 'shared-goals':
        return <SharedGoals onViewChange={setCurrentView} />;
      case 'settings':
        return <Settings onViewChange={setCurrentView} />;
      case 'goals':
        // For admin - show admin goals page
        if (role === 'admin') return <AdminGoals onViewChange={setCurrentView} />;
        return <Analytics onViewChange={setCurrentView} />;
      case 'reports':
        // For admin - show admin reports page
        if (role === 'admin') return <AdminReports onViewChange={setCurrentView} />;
        // For manager - show analytics
        return <Analytics onViewChange={setCurrentView} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <LottieIcon name="empty" className="w-32 h-32" />
             <h2 className="text-xl font-semibold text-gray-900 mt-4 capitalize">{currentView.replace('-', ' ')}</h2>
             <p className="text-gray-500 mt-2 max-w-md">This workflow is part of the enterprise portal but hasn't been fully mapped out in this demo yet.</p>
             <button onClick={() => setCurrentView('dashboard')} className="mt-6 text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">Return to Dashboard</button>
          </div>
        );
    }
  };

  return (
    <MainLayout 
      role={role} 
      currentView={currentView}
      onRoleChange={(newRole) => {
        // For demo purposes, allow role switching
        useAuthStore.getState().setDemoRole(newRole);
        setCurrentView('dashboard');
      }}
      onViewChange={setCurrentView}
      onLogout={async () => {
        await supabase.auth.signOut();
        clearAuth();
      }}
    >
      {renderView()}
    </MainLayout>
  );
}
