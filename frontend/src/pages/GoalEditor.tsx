import React, { useEffect, useState } from 'react';
import { View } from '../App';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Target, Plus, Trash2, AlertTriangle, Save, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { 
  fetchGoalSheet, 
  createGoalSheet, 
  createGoal, 
  updateGoal, 
  deleteGoal,
  submitGoalSheet 
} from '../lib/api/goals';
import type { GoalSheetWithGoals } from '../lib/api/goals';
import { LottieIcon } from '../components/ui/LottieIcon';

interface GoalEditorProps {
  onViewChange: (view: View) => void;
}

interface Goal {
  id?: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: 'min' | 'max' | 'timeline' | 'zero_based';
  target: string;
  targetDate: string;
  weightage: number;
}

const CURRENT_YEAR = 2026;

export function GoalEditor({ onViewChange }: GoalEditorProps) {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goalSheet, setGoalSheet] = useState<GoalSheetWithGoals | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  async function loadData() {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const sheet = await fetchGoalSheet(profile.id, CURRENT_YEAR);
      
      if (sheet) {
        setGoalSheet(sheet);
        const formGoals: Goal[] = (sheet.goals || []).map((g) => ({
          id: g.id,
          thrustArea: g.thrust_area,
          title: g.title,
          description: g.description || '',
          uom: g.uom_type,
          target: g.target?.toString() || '',
          targetDate: g.target_date || '',
          weightage: g.weightage,
        }));
        setGoals(formGoals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  }

  const addGoal = () => {
    if (goals.length >= 8) {
      alert('Maximum 8 goals allowed');
      return;
    }
    
    setGoals([...goals, {
      thrustArea: 'Operations',
      title: '',
      description: '',
      uom: 'min',
      target: '',
      targetDate: '',
      weightage: 0,
    }]);
  };

  const removeGoal = async (index: number) => {
    const goal = goals[index];
    
    if (goal.id) {
      try {
        await deleteGoal(goal.id);
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal');
        return;
      }
    }
    
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoalField = (index: number, field: keyof Goal, value: any) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const handleSaveDraft = async () => {
    if (!profile?.id) return;

    try {
      setSaving(true);
      
      let sheetId = goalSheet?.id;
      if (!sheetId) {
        const newSheet = await createGoalSheet(profile.id, CURRENT_YEAR);
        sheetId = newSheet.id;
        setGoalSheet(newSheet);
      }

      for (const [index, goal] of goals.entries()) {
        const goalData = {
          sheet_id: sheetId,
          employee_id: profile.id,
          thrust_area: goal.thrustArea,
          title: goal.title,
          description: goal.description || null,
          uom_type: goal.uom,
          target: goal.target ? parseFloat(goal.target) : null,
          target_date: goal.targetDate || null,
          weightage: goal.weightage,
          display_order: index,
        };

        if (goal.id) {
          await updateGoal(goal.id, goalData);
        } else {
          const created = await createGoal(goalData);
          const updated = [...goals];
          updated[index].id = created.id;
          setGoals(updated);
        }
      }

      alert('Goals saved successfully!');
      await loadData();
    } catch (error) {
      console.error('Error saving goals:', error);
      alert('Failed to save goals');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (totalWeightage !== 100) {
      alert('Total weightage must equal 100%');
      return;
    }

    if (goals.length < 3) {
      alert('Minimum 3 goals required');
      return;
    }

    if (!goalSheet?.id) {
      alert('Please save draft first');
      return;
    }

    try {
      setSaving(true);
      await submitGoalSheet(goalSheet.id);
      alert('Goals submitted for approval!');
      onViewChange('dashboard');
    } catch (error: any) {
      console.error('Error submitting goals:', error);
      alert(error.message || 'Failed to submit goals');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LottieIcon name="loading" className="w-32 h-32" />
      </div>
    );
  }

  const status = goalSheet?.status || 'draft';
  const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);
  const isWeightValid = totalWeightage === 100;
  const hasLowWeight = goals.some(g => (Number(g.weightage) || 0) > 0 && (Number(g.weightage) || 0) < 10);
  const tooManyGoals = goals.length > 8;
  const isLocked = status === 'submitted' || status === 'approved';

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative z-10 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Q2 {CURRENT_YEAR} Goal Sheet</h2>
            <Badge variant={status === 'draft' ? 'outline' : status === 'submitted' ? 'warning' : 'success'} className="border-gray-200">
              {status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-[15px] font-medium text-gray-500 mt-1">Define your performance objectives aligned with company OKRs.</p>
          {goalSheet?.return_reason && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-900">Manager Feedback:</p>
              <p className="text-sm text-amber-700">{goalSheet.return_reason}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {!isLocked && (
            <>
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={saving || goals.length === 0}
                className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50/80 hover:border-gray-300 rounded-[14px] px-6 py-2.5"
              >
                <Save className="w-[18px] h-[18px] mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                disabled={!isWeightValid || hasLowWeight || tooManyGoals || saving || goals.length < 3}
                onClick={handleSubmit}
                className="bg-gradient-to-b from-gray-800 to-gray-900 text-white rounded-[14px] px-8 py-2.5"
              >
                <Send className="w-[18px] h-[18px] mr-2" />
                Submit for Approval
              </Button>
            </>
          )}
          {isLocked && (
            <Button variant="secondary" disabled className="opacity-50 rounded-[14px] px-6 py-2.5">
              <Target className="w-[18px] h-[18px] mr-2" />
              Locked
            </Button>
          )}
        </div>
      </div>

      {/* Validation Summary */}
      <Card className={cn(
        "border-0 border-l-[6px] transition-colors bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] rounded-[24px]", 
        isWeightValid && !hasLowWeight && !tooManyGoals ? "border-l-emerald-500" : "border-l-amber-500"
      )}>
        <CardContent className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1.5">Total Weightage</div>
              <div className="flex items-baseline gap-1.5">
                <span className={cn("text-[36px] font-black tracking-tight leading-none", isWeightValid ? "text-emerald-500" : "text-amber-500")}>
                  {totalWeightage}%
                </span>
                <span className="text-[15px] font-bold text-gray-400">/ 100%</span>
              </div>
            </div>
            <div className="h-14 w-px bg-gray-200 hidden sm:block"></div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1.5">Goal Count</div>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-black tracking-tight text-gray-900 leading-none">{goals.length}</span>
                <span className="text-[14px] font-bold text-gray-400 uppercase tracking-wide">/ 8 Max</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-[14px] bg-gray-50 p-5 rounded-[16px] border border-gray-100 flex-1 max-w-md font-medium text-gray-600">
             {!isWeightValid && (
               <div className="flex items-start gap-2 text-amber-700 font-bold">
                 <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                 Total weightage must equal 100%. Currently {totalWeightage}%.
               </div>
             )}
             {hasLowWeight && (
               <div className="flex items-start gap-2 text-amber-700 font-bold">
                 <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                 Individual goals should have minimum 10% weightage.
               </div>
             )}
             {tooManyGoals && (
               <div className="flex items-start gap-2 text-red-600 font-bold">
                 <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                 Cannot exceed 8 goals in a single cycle.
               </div>
             )}
             {isWeightValid && !hasLowWeight && !tooManyGoals && goals.length >= 3 && (
               <div className="flex items-start gap-2 text-emerald-600 font-bold">
                 <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                 Goal sheet meets all requirements.
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Goal Editor Rows */}
      <div className="space-y-6">
        {goals.map((goal, index) => (
          <Card key={goal.id || index} className="overflow-hidden border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border-t-[4px] border-t-transparent hover:border-t-blue-500 transition-all">
            <div className="flex flex-col md:flex-row border-b border-gray-100">
              <div className="p-8 md:w-3/5 border-r border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <Badge variant="outline" className="font-mono text-[11px] px-3.5 py-1">
                    Goal {index + 1}
                  </Badge>
                  {!isLocked && (
                    <button onClick={() => removeGoal(index)} className="text-gray-400 hover:text-red-600 p-2.5 rounded-xl hover:bg-red-50">
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] ml-1 mb-2 block">Objective Title</label>
                    <input 
                      type="text" 
                      value={goal.title}
                      readOnly={isLocked}
                      onChange={(e) => updateGoalField(index, 'title', e.target.value)}
                      placeholder="e.g. Launch Q2 Marketing Campaign"
                      className="w-full px-5 py-4 text-[19px] font-extrabold bg-gray-50/50 border border-gray-200 rounded-[14px] focus:outline-none focus:ring-[4px] focus:ring-gray-200/50"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] ml-1 mb-2 block">Key Results & Context</label>
                    <textarea 
                      value={goal.description}
                      readOnly={isLocked}
                      onChange={(e) => updateGoalField(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Briefly describe what success looks like..."
                      className="w-full px-5 py-4 text-[16px] font-semibold bg-gray-50/50 border border-gray-200 rounded-[14px] focus:outline-none focus:ring-[4px] focus:ring-gray-200/50 resize-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-8 md:w-2/5 flex flex-col justify-center space-y-8 bg-gray-50/30">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] ml-1 mb-2 block">Thrust Area</label>
                    <select 
                      value={goal.thrustArea}
                      disabled={isLocked}
                      onChange={(e) => updateGoalField(index, 'thrustArea', e.target.value)}
                      className="w-full pl-4 pr-10 py-3.5 text-[14px] font-bold bg-white border border-gray-200 rounded-[12px]"
                    >
                      <option>Operations</option>
                      <option>Revenue</option>
                      <option>Productivity</option>
                      <option>Quality</option>
                      <option>Innovation</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] ml-1 mb-2 block">UOM Type</label>
                    <select 
                      value={goal.uom}
                      disabled={isLocked}
                      onChange={(e) => updateGoalField(index, 'uom', e.target.value)}
                      className="w-full pl-4 pr-10 py-3.5 text-[14px] font-bold bg-white border border-gray-200 rounded-[12px]"
                    >
                      <option value="min">MIN</option>
                      <option value="max">MAX</option>
                      <option value="timeline">Timeline</option>
                      <option value="zero_based">Zero Based</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] ml-1 mb-2 block">Target Value</label>
                    <input 
                      type="text" 
                      value={goal.target}
                      readOnly={isLocked}
                      onChange={(e) => updateGoalField(index, 'target', e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full px-4 py-3.5 text-[15px] bg-white border border-gray-200 rounded-[12px] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] ml-1 mb-2 block">Weightage %</label>
                    <input 
                      type="number" 
                      value={goal.weightage || ''}
                      readOnly={isLocked}
                      onChange={(e) => updateGoalField(index, 'weightage', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3.5 text-[15px] bg-white border border-gray-200 rounded-[12px] font-mono font-bold text-right"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!isLocked && (
        <button 
          onClick={addGoal}
          className="w-full py-8 bg-gray-50/50 border-[3px] border-dashed border-gray-200 rounded-[32px] text-gray-500 font-extrabold text-[16px] flex items-center justify-center hover:bg-white hover:text-gray-900 hover:border-gray-300 transition-all"
        >
          <Plus className="w-[18px] h-[18px] mr-3" />
          Add Another Objective
        </button>
      )}
      
      {goals.length === 0 && (
         <div className="text-center py-24 bg-white rounded-[32px] border border-gray-100">
           <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mx-auto mb-8">
            <Target className="w-12 h-12 text-blue-600" />
           </div>
           
           <h3 className="text-gray-900 font-extrabold text-[28px] mb-3">No Objectives Defined</h3>
           <p className="text-[17px] font-medium text-gray-500 max-w-md mx-auto mb-10">Start building your performance plan by creating clear, measurable objectives.</p>
             
           <Button onClick={addGoal} className="rounded-[18px] bg-gradient-to-b from-blue-500 to-blue-700 text-white px-10 py-5">
             <Plus className="w-[22px] h-[22px] mr-2.5" /> 
             Create First Objective
           </Button>
         </div>
      )}
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
