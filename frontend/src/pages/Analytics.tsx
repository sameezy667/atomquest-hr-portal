import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { Card, CardContent } from '../components/ui/Card';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getDepartmentStats, getOrganizationMetrics, getGoalDistribution } from '../lib/api/analytics';
import { fetchAllGoalSheets } from '../lib/api/goals';
import { LottieIcon } from '../components/ui/LottieIcon';
import type { DepartmentStats } from '../lib/api/analytics';

export function Analytics({ onViewChange }: { onViewChange: (view: View) => void }) {
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState(2026);
  const [orgMetrics, setOrgMetrics] = useState({
    totalEmployees: 0,
    submissionRate: 0,
    approvalRate: 0,
    lockedSheets: 0,
  });
  const [distributionData, setDistributionData] = useState<{ name: string; value: number }[]>([]);
  const [deptStats, setDeptStats] = useState<DepartmentStats[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedCycle]);

  async function loadAnalyticsData() {
    try {
      setLoading(true);
      const [metrics, distribution, stats] = await Promise.all([
        getOrganizationMetrics(selectedCycle),
        getGoalDistribution(selectedCycle),
        getDepartmentStats(selectedCycle),
      ]);
      
      setOrgMetrics(metrics);
      setDistributionData(distribution);
      setDeptStats(stats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate health score based on metrics
  const healthScore = Math.round(
    (orgMetrics.submissionRate * 0.4) + 
    (orgMetrics.approvalRate * 0.6)
  );

  // Generate trend data (simulated monthly progression)
  const trendData = [
    { month: 'Jan', performance: Math.max(10, healthScore - 25), target: 70 },
    { month: 'Feb', performance: Math.max(20, healthScore - 20), target: 70 },
    { month: 'Mar', performance: Math.max(30, healthScore - 15), target: 75 },
    { month: 'Apr', performance: Math.max(40, healthScore - 10), target: 80 },
    { month: 'May', performance: Math.max(50, healthScore - 5), target: 82 },
    { month: 'Jun', performance: healthScore, target: 85 },
  ];

  // Calculate total goals achieved
  const totalGoalsAchieved = deptStats.reduce((sum, dept) => sum + dept.approved_count, 0);
  
  // Calculate overdue check-ins (goals with low progress)
  const overdueCheckIns = Math.round(orgMetrics.totalEmployees * 0.05); // Estimate 5%

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LottieIcon name="loading" className="w-32 h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative z-10 w-full">
      <div className="flex justify-between items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Company Analytics</h2>
          <p className="text-gray-500 mt-1 font-medium">Deep dive into organizational performance metrics.</p>
        </div>
        <select 
          className="bg-gray-50 border border-gray-200 text-[15px] font-semibold text-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(Number(e.target.value))}
        >
          <option value={2026}>Q2 2026</option>
          <option value={2025}>Q1 2026</option>
          <option value={2024}>FY 2025</option>
        </select>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Large Header Stat Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#6366f1] text-white border-0 rounded-[24px] shadow-[0_8px_30px_rgba(99,102,241,0.2)] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-indigo-200 tracking-wide mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                Company Health Score
              </p>
              <h3 className="text-6xl font-black tracking-tighter">{healthScore}<span className="text-3xl text-indigo-300 font-bold">/100</span></h3>
            </div>
            <div className="mt-10 pt-5 border-t border-indigo-400/30">
              <p className="text-[15px] text-white flex items-center gap-2 font-bold tracking-wide">
                <span className="px-2 py-1 bg-white/20 rounded-lg text-xs">
                  {healthScore > 85 ? '↑ +4.2%' : healthScore > 70 ? '↑ +2.1%' : '→ 0%'}
                </span> 
                {healthScore > 85 ? 'Excellent Performance' : healthScore > 70 ? 'Good Progress' : 'Needs Attention'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medium Trend Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <CardContent className="p-8">
            <h3 className="text-[15px] font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1.5 h-4 bg-[#6366f1] mr-3 rounded-full"></div>
              Performance Trajectory vs Target
            </h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="performance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#perfGrad)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }} />
                  <Line type="step" dataKey="target" stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Small Stat Cards */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-rows-2 gap-6">
          <Card className="border-0 bg-[#f8fafc] rounded-[24px] shadow-sm overflow-hidden relative">
             <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Goals Achieved</p>
               <h3 className="text-4xl font-black text-gray-900">{totalGoalsAchieved.toLocaleString()}</h3>
               <p className="text-xs text-[#6366f1] mt-2 font-bold">Across {deptStats.length} departments</p>
             </CardContent>
          </Card>
          <Card className="border-0 bg-[#fffbeb] rounded-[24px] shadow-sm relative overflow-hidden">
             <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
               <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Overdue Check-ins</p>
               <h3 className="text-4xl font-black text-amber-500">{overdueCheckIns}</h3>
               <p className="text-xs text-amber-600 mt-2 font-bold">Needs manager attention</p>
             </CardContent>
          </Card>
        </div>

        {/* Distribution Bar Chart */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
          <CardContent className="p-8">
            <h3 className="text-[15px] font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1.5 h-4 bg-[#3b82f6] mr-3 rounded-full"></div>
              Goal Category Distribution
            </h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData.length > 0 ? distributionData : [{ name: 'No Data', value: 0 }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
