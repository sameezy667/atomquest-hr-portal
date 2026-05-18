import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Check, X, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { fetchGoalSheet, approveGoalSheet, returnGoalSheet, updateGoal } from '../lib/api/goals';
import type { GoalSheetWithGoals } from '../lib/api/goals';
import type { Goal } from '../lib/types/database';
import { LottieIcon } from '../components/ui/LottieIcon';

export function GoalReview({ onViewChange }: { onViewChange: (view: View) => void }) {
  const { profile } = useAuthStore();
  const [sheet, setSheet] = useState<GoalSheetWithGoals | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSheetForReview();
  }, []);

  async function loadSheetForReview() {
    try {
      setLoading(true);
      
      // Get sheet ID from session storage (set by Manager Dashboard)
      const sheetId = sessionStorage.getItem('reviewSheetId');
      
      if (!sheetId) {
        // If no specific sheet, get first pending review
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
          .in('status', ['submitted', 'under_review'])
          .order('submitted_at', { ascending: true })
          .limit(1)
          .single();
        
        if (error) throw error;
        setSheet(data);
        setGoals(data.goals || []);
      } else {
        // Load specific sheet
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
          .eq('id', sheetId)
          .single();
        
        if (error) throw error;
        setSheet(data);
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error loading sheet for review:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);

  const updateGoalField = async (goalId: string, field: string, value: string | number) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, [field]: value } : g));
  };

  const handleApprove = async () => {
    if (!sheet || !profile?.id || totalWeightage !== 100) return;
    
    try {
      setSaving(true);
      setError(null);
      
      console.log('🔄 Starting approval process for sheet:', sheet.id);
      
      // Save any goal changes first
      for (const goal of goals) {
        console.log('💾 Updating goal:', goal.id);
        await updateGoal(goal.id, {
          target: goal.target,
          weightage: goal.weightage,
        });
      }
      
      console.log('✅ All goals updated, approving sheet...');
      
      // Approve the sheet
      await approveGoalSheet(sheet.id, profile.id);
      
      console.log('✅ Sheet approved successfully');
      
      // Clear session storage
      sessionStorage.removeItem('reviewSheetId');
      
      // Navigate back
      onViewChange('dashboard');
    } catch (error: any) {
      console.error('❌ Error approving goals:', error);
      setError(error.message || 'Failed to approve goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async () => {
    if (!sheet || !profile?.id || !comment.trim()) {
      setError('Please provide a reason for returning the goals.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      console.log('🔄 Returning sheet to employee:', sheet.id);
      
      // Return the sheet with comment
      await returnGoalSheet(sheet.id, profile.id, comment);
      
      console.log('✅ Sheet returned successfully');
      
      // Clear session storage
      sessionStorage.removeItem('reviewSheetId');
      
      // Navigate back
      onViewChange('dashboard');
    } catch (error: any) {
      console.error('❌ Error returning goals:', error);
      setError(error.message || 'Failed to return goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LottieIcon name="loading" className="w-32 h-32" />
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <LottieIcon name="empty" className="w-32 h-32" />
        <p className="text-gray-500 font-medium">No goals pending review</p>
        <Button onClick={() => onViewChange('dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const employee = sheet.employee;

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative z-10 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Goal Approval Review</h2>
            <Badge variant="warning">{sheet.status === 'submitted' ? 'Submitted - Awaiting Review' : 'Under Review'}</Badge>
          </div>
          <p className="text-[14px] text-gray-500 font-medium">
            Employee: <span className="font-bold text-gray-900">{employee?.full_name || 'Unknown'}</span> • 
            Role: {employee?.designation || 'Employee'} • 
            Cycle: Q2 {sheet.cycle_year}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="text-gray-700 bg-white border-gray-200 hover:bg-gray-50" 
            onClick={handleReturn}
            disabled={saving || !comment.trim()}
          >
            <X className="w-4 h-4 mr-2" />
            Return to Employee
          </Button>
          <Button 
            variant="primary" 
            disabled={totalWeightage !== 100 || saving} 
            onClick={handleApprove} 
            className="shadow-sm"
          >
            <Check className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Approve Goals'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Review Area */}
        <div className="flex-1 space-y-6 w-full">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 text-[14px] text-blue-800 font-medium shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
            <p className="leading-relaxed">You can adjust Targets and Weightages inline before approving. Any changes will be logged and notified to the employee.</p>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="col-span-1">No.</div>
              <div className="col-span-5">Goal Description</div>
              <div className="col-span-3">Target & UoM</div>
              <div className="col-span-3">Weightage</div>
            </div>
            
            <div className="divide-y divide-gray-100 bg-white">
              {goals.map((goal, index) => (
                <div key={goal.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-1 text-sm font-bold font-mono text-gray-400">
                    {('0' + (index + 1)).slice(-2)}
                  </div>
                  <div className="col-span-5 pr-4">
                    <p className="text-[15px] font-bold text-gray-900 mb-2">{goal.title}</p>
                    <Badge variant="outline">{goal.thrust_area}</Badge>
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="text" 
                      value={goal.target || ''}
                      onChange={(e) => updateGoalField(goal.id, 'target', e.target.value)}
                      className="w-full xl:w-5/6 px-4 py-2.5 text-[14px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-colors text-gray-900 font-mono font-medium"
                    />
                    <div className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest">{goal.uom}</div>
                  </div>
                  <div className="col-span-3 relative flex items-center gap-2">
                    <div className="relative w-28">
                      <input 
                        type="number" 
                        value={goal.weightage || 0}
                        onChange={(e) => updateGoalField(goal.id, 'weightage', parseInt(e.target.value) || 0)}
                        className="w-full pr-8 pl-3 py-2 text-base font-mono font-bold text-blue-600 bg-blue-50 border border-transparent rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-colors text-right"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Weightage</span>
              <span className={cn(
                "text-[22px] font-black font-mono",
                totalWeightage === 100 ? "text-emerald-500" : "text-amber-500"
              )}>
                {totalWeightage}%
              </span>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-80 space-y-6">
          <Card className="bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border-0">
            <CardContent className="p-8">
               <h3 className="text-[15px] font-bold tracking-tight text-gray-900 mb-5 flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-blue-600" />
                 Review Notes
               </h3>
               <textarea 
                 value={comment}
                 onChange={(e) => setComment(e.target.value)}
                 placeholder="Add notes for the employee here..."
                 className="w-full text-[14px] font-medium resize-none h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors text-gray-800 placeholder-gray-400"
               />
               <p className="text-xs text-gray-500 font-medium mt-3 leading-relaxed">These notes will be visible to the employee when you approve or return the goals.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border-0 relative overflow-hidden group">
            <CardContent className="p-8 relative z-10">
               <h3 className="text-[15px] font-bold tracking-tight text-gray-900 mb-6">Employee Context</h3>
               <div className="space-y-5">
                 <div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Previous Cycle Perf.</div>
                   <div className="text-[14px] font-bold text-gray-900 mt-1">{sheet.overall_score ? `${sheet.overall_score}%` : 'N/A'}</div>
                 </div>
                 <div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Goals</div>
                   <div className="text-[14px] font-medium text-gray-500 mt-1">{goals.length} goals</div>
                 </div>
                 <div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Submission Date</div>
                   <div className="text-[14px] font-bold text-gray-900 mt-1">
                     {sheet.submitted_at ? new Date(sheet.submitted_at).toLocaleString('en-US', {
                       month: 'short',
                       day: 'numeric',
                       year: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                     }) : 'Not submitted'}
                   </div>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
