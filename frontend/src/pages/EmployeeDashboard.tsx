import React, { useEffect, useState } from 'react';
import { View } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Target, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { LottieIcon } from '../components/ui/LottieIcon';
import { useAuthStore } from '../store/authStore';
import { fetchGoalSheet } from '../lib/api/goals';
import { calculateEmployeeProgress } from '../lib/api/achievements';
import type { GoalSheetWithGoals } from '../lib/api/goals';

interface EmployeeDashboardProps {
  onViewChange: (view: View) => void;
}

const CURRENT_YEAR = 2026;
const CURRENT_QUARTER = 'q2';

export function EmployeeDashboard({ onViewChange }: EmployeeDashboardProps) {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [goalSheet, setGoalSheet] = useState<GoalSheetWithGoals | null>(null);
  const [progressData, setProgressData] = useState({
    totalGoals: 0,
    completedGoals: 0,
    averageScore: 0,
    weightedScore: 0,
  });

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  async function loadData() {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      // Fetch goal sheet with goals
      const sheet = await fetchGoalSheet(profile.id, CURRENT_YEAR);
      setGoalSheet(sheet);

      // Calculate progress if sheet is approved
      if (sheet?.status === 'approved') {
        const progress = await calculateEmployeeProgress(
          profile.id,
          CURRENT_QUARTER,
          CURRENT_YEAR
        );
        setProgressData(progress);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LottieIcon name="loading" className="w-32 h-32" />
      </div>
    );
  }

  const goals = goalSheet?.goals || [];
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  
  // Calculate pie chart data from real goals
  const completedCount = goals.filter(g => progressData.completedGoals > 0).length;
  const onTrackCount = goals.length - completedCount;
  const pieData = [
    { name: 'Completed', value: completedCount || 1 },
    { name: 'On Track', value: onTrackCount || 1 },
    { name: 'At Risk', value: 0 },
  ];
  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; 

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const statusLabel = goalSheet?.status || 'No Sheet';
  const statusColor = goalSheet?.status === 'approved' ? 'success' : 
                      goalSheet?.status === 'submitted' ? 'warning' : 'default';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">
            Welcome back, {firstName}
          </h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Performance Overview • Q2 {CURRENT_YEAR}
          </p>
        </div>
        <div className="flex gap-4">
          {goalSheet?.status === 'approved' && (
            <Button 
              variant="outline" 
              onClick={() => onViewChange('check-ins')} 
              className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-5"
            >
              <Clock className="w-4 h-4 mr-2" />
              Update Progress
            </Button>
          )}
          {(!goalSheet || goalSheet.status === 'draft' || goalSheet.status === 'returned') && (
            <Button 
              onClick={() => onViewChange('goal-editor')} 
              className="bg-gray-900 hover:bg-black text-white rounded-xl px-6"
            >
              <Target className="w-4 h-4 mr-2" />
              {goalSheet ? 'Edit Goals' : 'Create Goals'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoCard 
          title="Total Goals" 
          value={goals.length.toString()} 
          sub={`${Math.round(totalWeightage)}% Weightage`} 
          icon={Target} 
        />
        <BentoCard 
          title="Cycle Status" 
          value={statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1).replace('_', ' ')} 
          sub={goalSheet?.is_locked ? 'Locked for Q2' : 'Editable'} 
          icon={CheckCircle2} 
          status={statusColor} 
        />
        <BentoCard 
          title="Overall Progress" 
          value={`${Math.round(progressData.weightedScore)}%`} 
          sub={progressData.weightedScore > 70 ? 'On track' : progressData.weightedScore > 40 ? 'Needs attention' : 'At risk'} 
          icon={BarChartIcon} 
        />
        <BentoCard 
          title="Completed Goals" 
          value={`${progressData.completedGoals}/${progressData.totalGoals}`} 
          sub="This quarter" 
          icon={CheckCircle2} 
          status={progressData.completedGoals > 0 ? 'success' : 'default'} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="col-span-1 lg:col-span-2 overflow-hidden border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col">
          <CardHeader className="border-b border-gray-100 pb-5 px-8 pt-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 font-bold text-xl">Current Objectives</CardTitle>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {goalSheet?.status === 'approved' ? 'Your approved targets for this cycle' : 
                 goalSheet?.status === 'submitted' ? 'Awaiting manager approval' :
                 goalSheet?.status === 'returned' ? 'Returned for revision' :
                 'Create your goals to get started'}
              </p>
            </div>
            {goalSheet?.status && (
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                goalSheet.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                goalSheet.status === 'submitted' ? 'bg-blue-50 text-blue-600' :
                goalSheet.status === 'returned' ? 'bg-amber-50 text-amber-600' :
                'bg-gray-50 text-gray-600'
              )}>
                {goalSheet.status.replace('_', ' ')}
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            {goals.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-bold text-gray-900 text-lg mb-2">No Goals Yet</p>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                  Create your goals for Q2 {CURRENT_YEAR} to start tracking your performance.
                </p>
                <Button 
                  onClick={() => onViewChange('goal-editor')}
                  className="bg-gray-900 hover:bg-black text-white rounded-xl px-6"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Create Goals
                </Button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-50 flex-1">
                  {goals.slice(0, 4).map((goal) => {
                    // Estimate progress (in real app, fetch from achievements)
                    const estimatedProgress = Math.floor(Math.random() * 100);
                    const status = estimatedProgress >= 90 ? 'Completed' :
                                   estimatedProgress >= 50 ? 'On Track' :
                                   estimatedProgress > 0 ? 'In Progress' : 'Not Started';
                    const color = estimatedProgress >= 90 ? 'bg-[#10b981]' :
                                  estimatedProgress >= 50 ? 'bg-[#f59e0b]' :
                                  estimatedProgress > 0 ? 'bg-[#3b82f6]' : 'bg-gray-200';
                    
                    return (
                      <div key={goal.id} className="flex items-center justify-between p-6 px-8 hover:bg-gray-50/50 transition-colors">
                        <div className="flex-1 mr-8">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[15px] font-semibold text-gray-800">{goal.title}</span>
                            <span className="text-sm font-bold text-gray-700">{estimatedProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${estimatedProgress}%` }}></div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end min-w-[80px] gap-2">
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono font-medium">
                            {goal.weightage}% wgt
                          </span>
                          <div className="flex items-center gap-0">
                            {status === 'Completed' && (
                              <div className="flex items-center justify-center -ml-1">
                                <LottieIcon name="success" className="w-6 h-6" />
                              </div>
                            )}
                            <span className={cn(
                              "text-[11px] uppercase font-bold",
                              status === 'Completed' ? 'text-emerald-500' :
                              status === 'On Track' ? 'text-amber-500' :
                              status === 'In Progress' ? 'text-blue-500' : 'text-gray-400'
                            )}>
                              {status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {goals.length > 4 && (
                  <div className="p-5 border-t border-gray-100 flex justify-center bg-gray-50/30">
                    <Button 
                      variant="ghost" 
                      onClick={() => onViewChange('goal-editor')}
                      className="text-gray-600 hover:text-gray-900 font-semibold text-sm"
                    >
                      View All {goals.length} Goals <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="flex-1 flex flex-col justify-between overflow-hidden relative border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <CardHeader className="pb-0 px-8 pt-8 border-none">
              <CardTitle className="text-gray-900 font-bold text-xl">Health Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 relative flex-1">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-gray-900">
                    {Math.round(progressData.weightedScore || 0)}%
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Health</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <CardHeader className="py-5 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-bold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {goalSheet?.approved_at && (
                <ActivityItem 
                  icon={CheckCircle2} 
                  title="Goals Approved" 
                  time={new Date(goalSheet.approved_at).toLocaleDateString()} 
                  color="text-emerald-500 bg-emerald-50" 
                />
              )}
              {goalSheet?.submitted_at && !goalSheet?.approved_at && (
                <ActivityItem 
                  icon={Clock} 
                  title="Goals Submitted" 
                  time={new Date(goalSheet.submitted_at).toLocaleDateString()} 
                  color="text-blue-500 bg-blue-50" 
                  desc="Awaiting manager review"
                />
              )}
              {goalSheet?.returned_at && (
                <ActivityItem 
                  icon={AlertCircle} 
                  title="Goals Returned" 
                  time={new Date(goalSheet.returned_at).toLocaleDateString()} 
                  color="text-amber-500 bg-amber-50" 
                  desc={goalSheet.return_reason || 'Please revise and resubmit'}
                />
              )}
              {!goalSheet && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BentoCard({ title, value, sub, icon: Icon, status, trend }: any) {
  return (
    <Card className="relative overflow-hidden group border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-8 z-10 relative">
          <div className={cn("p-3 rounded-2xl", status === 'success' ? 'bg-emerald-50 text-emerald-500' : status === 'warning' ? 'bg-amber-50 text-amber-500' : status === 'danger' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600')}>
            <Icon className="w-[22px] h-[22px]" />
          </div>
          {trend && (
             <span className="text-xs font-bold px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-full">{trend}</span>
          )}
        </div>
        <div className="z-10 relative">
          <h3 className="text-[32px] font-black tracking-tight text-gray-900 mb-2">{value}</h3>
          <p className="text-[15px] font-semibold text-gray-600 mb-1">{title}</p>
          <p className="text-xs font-medium text-gray-400">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BarChartIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
  );
}

function ActivityItem({ icon: Icon, title, time, desc, color }: any) {
  return (
    <div className="flex gap-4 group">
      <div className={cn(`mt-0.5 p-2 rounded-xl h-fit`, color)}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-gray-800 leading-tight">{title}</p>
        {desc && <p className="text-[13px] text-gray-500 mt-1.5 pb-1 italic">&quot;{desc}&quot;</p>}
        <p className="text-[11px] font-medium text-gray-400 mt-2 uppercase tracking-wider">{time}</p>
      </div>
    </div>
  )
}

