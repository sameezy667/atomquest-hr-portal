import React, { useEffect, useState } from 'react';
import { View } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { fetchGoalSheet } from '../lib/api/goals';
import { fetchEmployeeAchievements, upsertAchievement } from '../lib/api/achievements';
import type { AchievementWithGoal } from '../lib/api/achievements';
import { LottieIcon } from '../components/ui/LottieIcon';
import { Save, CheckCircle2, AlertCircle, TrendingUp, Lock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CURRENT_QUARTER = 'q2'; // In production, calculate from current date
const CURRENT_YEAR = 2026;

interface GoalCycle {
  id: string;
  name: string;
  cycle_year: number;
  cycle_type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export function CheckIns({ onViewChange }: { onViewChange: (view: View) => void }) {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [achievements, setAchievements] = useState<AchievementWithGoal[]>([]);
  const [hasApprovedSheet, setHasApprovedSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { achievement: string; notes: string; status: string }>>({});
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [currentCycle, setCurrentCycle] = useState<GoalCycle | null>(null);

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  async function loadData() {
    if (!profile?.id) return;

    try {
      setLoading(true);

      // Check if current date is within the check-in window
      const { data: cycleData, error: cycleError } = await supabase
        .from('goal_cycles')
        .select('*')
        .eq('cycle_year', CURRENT_YEAR)
        .eq('cycle_type', CURRENT_QUARTER)
        .maybeSingle();

      if (cycleError) {
        console.error('Error fetching cycle:', cycleError);
      } else if (cycleData) {
        setCurrentCycle(cycleData);
        const today = new Date();
        const startDate = new Date(cycleData.start_date);
        const endDate = new Date(cycleData.end_date);
        setIsWindowOpen(today >= startDate && today <= endDate);
      }

      // Check if employee has an approved goal sheet
      const sheet = await fetchGoalSheet(profile.id, CURRENT_YEAR);
      
      if (!sheet || sheet.status !== 'approved') {
        setHasApprovedSheet(false);
        setLoading(false);
        return;
      }

      setHasApprovedSheet(true);

      // Fetch achievements for current quarter
      const achievementsData = await fetchEmployeeAchievements(
        profile.id,
        CURRENT_QUARTER,
        CURRENT_YEAR
      );

      setAchievements(achievementsData);

      // Initialize form data
      const initialFormData: Record<string, { achievement: string; notes: string; status: string }> = {};
      achievementsData.forEach((a) => {
        initialFormData[a.goal_id] = {
          achievement: a.actual_achievement?.toString() || '',
          notes: a.achievement_notes || '',
          status: a.status || 'not_started',
        };
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(goalId: string) {
    if (!profile?.id) return;

    // Check if window is open before saving
    if (!isWindowOpen) {
      alert('Check-in window is currently closed. Updates can only be made during the active check-in period.');
      return;
    }

    try {
      setSaving(true);
      const data = formData[goalId];

      await upsertAchievement({
        goal_id: goalId,
        employee_id: profile.id,
        quarter: CURRENT_QUARTER,
        cycle_year: CURRENT_YEAR,
        actual_achievement: data.achievement ? parseFloat(data.achievement) : null,
        achievement_notes: data.notes || null,
        status: data.status as 'not_started' | 'on_track' | 'completed',
        entered_by: profile.id,
      });

      // Reload data to get updated progress scores
      await loadData();
      setEditingId(null);
    } catch (error) {
      console.error('Error saving achievement:', error);
      alert('Failed to save achievement. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function updateFormData(goalId: string, field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value,
      },
    }));
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LottieIcon name="loading" className="w-32 h-32" />
      </div>
    );
  }

  if (!hasApprovedSheet) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto relative z-10 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100 gap-4">
          <div>
            <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Quarterly Check-ins</h2>
            <p className="text-gray-500 mt-1 font-medium">Update your progress against your approved goals.</p>
          </div>
          <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-5" onClick={() => onViewChange('dashboard')}>Return to Dashboard</Button>
        </div>

        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <CardContent className="p-16 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 rounded-full bg-amber-50 mb-6 flex items-center justify-center border border-amber-100 shadow-sm">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
            <p className="font-bold text-gray-900 text-xl">No Approved Goals Yet</p>
            <p className="text-[15px] mt-2 text-gray-500 font-medium max-w-md">You need to have approved goals before you can track quarterly progress. Please create and submit your goal sheet first.</p>
            <Button onClick={() => onViewChange('goal-editor')} className="mt-6 bg-gray-900 hover:bg-black text-white rounded-xl px-6">Create Goals</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative z-10 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100 gap-4">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Q2 2026 Check-ins</h2>
          <p className="text-gray-500 mt-1 font-medium">Update your progress against your approved goals.</p>
          {currentCycle && (
            <div className="mt-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Check-in Window: {new Date(currentCycle.start_date).toLocaleDateString()} - {new Date(currentCycle.end_date).toLocaleDateString()}
              </span>
              {isWindowOpen ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">Window Open</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 border-red-200">Window Closed</Badge>
              )}
            </div>
          )}
        </div>
        <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-5" onClick={() => onViewChange('dashboard')}>Return to Dashboard</Button>
      </div>

      {!isWindowOpen && currentCycle && (
        <Card className="border-0 bg-amber-50 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden border border-amber-200">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Check-in Window Closed</h3>
              <p className="text-amber-700 mt-1">
                The check-in window for Q2 2026 is currently closed. You can view your progress but cannot make updates until the next check-in period opens on {new Date(currentCycle.start_date).toLocaleDateString()}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {achievements.map((achievement) => {
          const goal = achievement.goal;
          if (!goal) return null;

          const isEditing = editingId === goal.id;
          const data = formData[goal.id] || { achievement: '', notes: '', status: 'not_started' };

          return (
            <Card key={achievement.id} className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-gray-900 text-lg font-bold mb-2">{goal.title}</CardTitle>
                    <div className="flex gap-3 text-sm">
                      <span className="text-gray-500">
                        <span className="font-semibold">Thrust Area:</span> {goal.thrust_area}
                      </span>
                      <span className="text-gray-500">
                        <span className="font-semibold">Target:</span> {goal.target || 'N/A'}
                      </span>
                      <span className="text-gray-500">
                        <span className="font-semibold">Weightage:</span> {goal.weightage}%
                      </span>
                    </div>
                  </div>
                  {achievement.progress_score !== null && (
                    <div className="text-right">
                      <div className="text-3xl font-black text-gray-900">{Math.round(achievement.progress_score)}%</div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Progress Score</div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Achievement</label>
                    <input
                      type="number"
                      step="0.01"
                      value={data.achievement}
                      onChange={(e) => updateFormData(goal.id, 'achievement', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter value"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={data.status}
                      onChange={(e) => updateFormData(goal.id, 'status', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="on_track">On Track</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    {isEditing ? (
                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={() => handleSave(goal.id)}
                          disabled={saving || !isWindowOpen}
                          className="flex-1 bg-gray-900 hover:bg-black text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                          className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setEditingId(goal.id)}
                        variant="outline"
                        disabled={!isWindowOpen}
                        className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isWindowOpen ? (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Update Progress
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Window Closed
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Achievement Notes</label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => updateFormData(goal.id, 'notes', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                    placeholder="Describe your progress, challenges, and key achievements..."
                  />
                </div>

                {achievement.entered_at && (
                  <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    Last updated: {new Date(achievement.entered_at).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 mb-6 flex items-center justify-center border border-gray-100 shadow-sm mx-auto">
              <TrendingUp className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-bold text-gray-900 text-xl">No Goals to Track</p>
            <p className="text-[15px] mt-2 text-gray-500 font-medium">Your approved goals will appear here for quarterly progress tracking.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
