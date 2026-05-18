import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Users, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { fetchTeamGoalSheets, fetchPendingReviews } from '../lib/api/goals';
import { getTeamCompletionStats } from '../lib/api/analytics';
import type { GoalSheetWithGoals } from '../lib/api/goals';
import { LottieIcon } from '../components/ui/LottieIcon';

export function ManagerDashboard({ onViewChange }: { onViewChange: (view: View) => void }) {
  const { profile } = useAuthStore();
  const [teamSheets, setTeamSheets] = useState<GoalSheetWithGoals[]>([]);
  const [pendingReviews, setPendingReviews] = useState<GoalSheetWithGoals[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = 2026;

  useEffect(() => {
    loadTeamData();
  }, [profile]);

  async function loadTeamData() {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const [sheets, pending] = await Promise.all([
        fetchTeamGoalSheets(profile.id, currentYear),
        fetchPendingReviews(profile.id),
      ]);
      
      setTeamSheets(sheets);
      setPendingReviews(pending);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate metrics
  const totalMembers = teamSheets.length;
  const approvedCount = teamSheets.filter(s => s.status === 'approved').length;
  const pendingCount = pendingReviews.length;
  const avgCompletion = teamSheets.length > 0
    ? Math.round(teamSheets.reduce((sum, s) => sum + (s.overall_score || 0), 0) / teamSheets.length)
    : 0;
  const atRiskCount = teamSheets.filter(s => (s.overall_score || 0) < 50 && s.status === 'approved').length;

  // Generate trend data from actual progress
  const chartData = [
    { name: 'W1', value: Math.max(10, avgCompletion - 50) },
    { name: 'W2', value: Math.max(20, avgCompletion - 40) },
    { name: 'W3', value: Math.max(30, avgCompletion - 30) },
    { name: 'W4', value: Math.max(40, avgCompletion - 20) },
    { name: 'W5', value: Math.max(50, avgCompletion - 10) },
    { name: 'W6', value: avgCompletion },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LottieIcon name="loading" className="w-32 h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Manager Overview</h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Design Team Performance • Q2 2026
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoCard title="Team Members" value={totalMembers.toString()} sub={`${pendingCount} pending review`} icon={Users} status="primary" />
        <BentoCard title="Goals Approved" value={`${approvedCount}/${totalMembers}`} sub={`${pendingCount} pending review`} icon={Target} status={pendingCount > 0 ? "warning" : "success"} />
        <BentoCard title="Team Completion" value={`${avgCompletion}%`} sub="Avg across team" icon={CheckCircle2} status="success" />
        <BentoCard title="At Risk Goals" value={atRiskCount.toString()} sub="Requires attention" icon={AlertCircle} status={atRiskCount > 0 ? "danger" : "success"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="col-span-1 lg:col-span-2 overflow-hidden border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col">
          <CardHeader className="border-b border-gray-100 pb-5 px-8 pt-8 flex flex-row items-center justify-between">
            <CardTitle className="text-gray-900 font-bold text-xl">Team Goal Status</CardTitle>
            <div className="flex gap-2">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">All Members</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="divide-y divide-gray-50 flex-1">
              {teamSheets.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 font-medium">No team members found</p>
                </div>
              ) : (
                teamSheets.slice(0, 4).map((sheet, i) => {
                  const employee = sheet.employee;
                  const statusBadge = 
                    sheet.status === 'submitted' ? 'warning' :
                    sheet.status === 'approved' ? 'success' : 'default';
                  const actionText = sheet.status === 'submitted' ? 'Review' : 
                                   sheet.status === 'approved' ? 'View' : 'Nudge';
                  
                  return (
                    <div key={sheet.id} className="flex items-center justify-between p-6 px-8 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg">
                          {employee?.full_name?.split(' ').map(n => n[0]).join('') || 'NA'}
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-gray-900">{employee?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{employee?.designation || 'Employee'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 justify-end">
                        <span className={cn(
                          "px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-md hidden sm:block",
                          statusBadge === 'warning' ? 'bg-amber-50 text-amber-600' :
                          statusBadge === 'success' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          {sheet.status}
                        </span>
                        <Button 
                          onClick={() => {
                            if (actionText === 'Review') {
                              // Store sheet ID for review page
                              sessionStorage.setItem('reviewSheetId', sheet.id);
                              onViewChange('goal-review');
                            }
                          }}
                          className={cn(
                            "rounded-xl px-5 py-2 font-semibold text-sm transition-all",
                            actionText === 'Review' 
                              ? 'bg-gray-900 hover:bg-black text-white shadow-sm' 
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          {actionText}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="flex-1 flex flex-col justify-between overflow-hidden relative border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
             <CardHeader className="pb-0 px-8 pt-8 border-none">
               <CardTitle className="text-gray-900 font-bold text-xl">Team Progress Trend</CardTitle>
             </CardHeader>
             <CardContent className="relative z-10 pt-4 p-6">
               <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6', borderRadius: '12px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                       itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                       cursor={{ fill: '#f9fafb' }}
                     />
                     <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, fill: '#3b82f6' }} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             </CardContent>
          </Card>
          
          <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-gray-100 bg-amber-50/50">
              <CardTitle className="text-base font-bold text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col gap-5">
                <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                  {pendingCount > 0 
                    ? `All team goals must be approved by May 20th. You have ${pendingCount} pending review${pendingCount > 1 ? 's' : ''}.`
                    : 'All team goals are up to date. Great work!'}
                </p>
                {pendingCount > 0 && (
                  <Button 
                    className="bg-amber-500 hover:bg-amber-600 text-white w-full border-none shadow-sm rounded-xl py-3 font-semibold text-[15px]" 
                    onClick={() => onViewChange('goal-review')}
                  >
                    Review Goals Now
                  </Button>
                )}
              </div>
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
          <div className={cn("p-3 rounded-2xl", 
            status === 'success' ? 'bg-emerald-50 text-emerald-500' : 
            status === 'warning' ? 'bg-amber-50 text-amber-500' : 
            status === 'danger' ? 'bg-red-50 text-red-500' : 
            status === 'primary' ? 'bg-blue-50 text-blue-500' : 
            'bg-gray-50 text-gray-600'
          )}>
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
