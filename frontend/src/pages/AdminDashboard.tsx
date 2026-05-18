import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { View } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Settings, BarChart2, ListOrdered, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchAllGoalSheets } from '../lib/api/goals';
import { getDepartmentStats, getOrganizationMetrics } from '../lib/api/analytics';
import { LottieIcon } from '../components/ui/LottieIcon';
import type { GoalSheetWithGoals } from '../lib/api/goals';
import type { DepartmentStats } from '../lib/api/analytics';

export function AdminDashboard({ onViewChange }: { onViewChange: (view: View) => void }) {
  const [loading, setLoading] = useState(true);
  const [allSheets, setAllSheets] = useState<GoalSheetWithGoals[]>([]);
  const [deptStats, setDeptStats] = useState<DepartmentStats[]>([]);
  const [orgMetrics, setOrgMetrics] = useState({
    totalEmployees: 0,
    submissionRate: 0,
    approvalRate: 0,
    lockedSheets: 0,
  });
  const currentYear = 2026;

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      setLoading(true);
      const [sheets, stats, metrics] = await Promise.all([
        fetchAllGoalSheets({ cycle_year: currentYear }),
        getDepartmentStats(currentYear),
        getOrganizationMetrics(currentYear),
      ]);
      
      setAllSheets(sheets);
      setDeptStats(stats);
      setOrgMetrics(metrics);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate pending exceptions (submitted but not approved)
  const pendingExceptions = allSheets.filter(s => s.status === 'submitted' || s.status === 'under_review').length;
  
  // Count shared goals (would need separate query in real app)
  const activeSharedGoals = 4; // Placeholder

  // Transform department stats for chart
  const chartData = deptStats.map(dept => ({
    name: dept.department_name,
    completed: Math.round((dept.approved_count / dept.total_employees) * 100),
    active: 100 - Math.round((dept.approved_count / dept.total_employees) * 100),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LottieIcon name="loading" className="w-32 h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100 gap-4">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight flex items-center gap-3">
            Admin Control Center
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </h2>
          <p className="text-gray-500 mt-1 font-medium">Organization-wide Goal Tracking • Q2 2026 Cycle</p>
        </div>
        <Button variant="outline" className="border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100 rounded-xl px-5" onClick={() => onViewChange('settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Cycle Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPI value={orgMetrics.totalEmployees.toString()} label="Total Employees" color="text-gray-900" />
        <KPI value={`${orgMetrics.submissionRate}%`} label="Submission Rate" color="text-emerald-500" />
        <KPI value={`${orgMetrics.approvalRate}%`} label="Approval Rate" color="text-gray-900" />
        <KPI value={pendingExceptions.toString()} label="Pending Exceptions" color="text-amber-500" />
        <KPI value={activeSharedGoals.toString()} label="Active Shared Goals" color="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
          <CardHeader className="pb-2">
             <CardTitle className="text-gray-900 text-[15px] font-bold">Department Completion Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', completed: 0, active: 100 }]} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} width={80} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={24} />
                  <Bar dataKey="active" stackId="a" fill="#f3f4f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden relative group flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center pb-4 relative z-10 border-b border-gray-100">
            <CardTitle className="text-gray-900 text-[15px] font-bold">System Operations</CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-xs font-bold" onClick={() => onViewChange('audit')}>View Audit Logs</Button>
          </CardHeader>
          <CardContent className="p-0 relative z-10 flex-1">
             <div className="grid grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 h-full">
               <div className="p-8 hover:bg-gray-50/50 transition-colors flex flex-col justify-between">
                 <div>
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
                     <BarChart2 className="w-6 h-6" />
                   </div>
                   <h4 className="text-[17px] font-bold text-gray-900 mb-2">Company Analytics</h4>
                   <p className="text-[13px] text-gray-500 mb-6 leading-relaxed font-medium">View deep organizational performance metrics and trends.</p>
                 </div>
                 <Button className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-5" onClick={() => onViewChange('analytics')}>Open Analytics</Button>
               </div>
               <div className="p-8 hover:bg-gray-50/50 transition-colors flex flex-col justify-between">
                 <div>
                   <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-6">
                     <FileText className="w-6 h-6" />
                   </div>
                   <h4 className="text-[17px] font-bold text-gray-900 mb-2">Data Export</h4>
                   <p className="text-[13px] text-gray-500 mb-6 leading-relaxed font-medium">Download CSV reports for payroll and Headcount systems.</p>
                 </div>
                 <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-5" onClick={() => onViewChange('reports')}>View Reports</Button>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden mt-6">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 pt-5">
          <CardTitle className="text-gray-900 text-sm uppercase tracking-widest font-bold">Recent Administrative Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
             {allSheets.slice(0, 3).map((sheet, i) => {
               const alertType = sheet.status === 'submitted' ? 'Pending' : 
                                sheet.status === 'returned' ? 'Review Needed' : 'Completed';
               const alertDesc = sheet.status === 'submitted' 
                 ? `${sheet.employee?.full_name} submitted goals for approval.`
                 : sheet.status === 'returned'
                 ? `${sheet.employee?.full_name}'s goals were returned for revision.`
                 : `${sheet.employee?.full_name}'s goals were approved.`;
               
               return (
                 <div key={sheet.id} className="flex items-center justify-between p-6 px-8 hover:bg-gray-50/50 transition-colors text-sm">
                   <div className="flex items-start gap-5 flex-1">
                     <div className="mt-0.5">
                       <span className={cn(
                         "px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md",
                         alertType === 'Pending' ? 'bg-amber-100 text-amber-700' :
                         alertType === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                         'bg-red-100 text-red-700'
                       )}>
                         {alertType}
                       </span>
                     </div>
                     <div>
                       <p className="font-bold text-gray-900 text-[15px] leading-snug">{alertDesc}</p>
                       <p className="text-xs font-mono text-gray-500 mt-1.5 font-medium">
                         {sheet.id.slice(0, 8).toUpperCase()} <span className="mx-1">•</span> 
                         <span className="font-sans font-medium">
                           {sheet.updated_at ? new Date(sheet.updated_at).toLocaleDateString() : 'Recently'}
                         </span>
                       </p>
                     </div>
                   </div>
                   {alertType === 'Pending' && (
                     <Button 
                       size="sm" 
                       className="bg-gray-900 hover:bg-black text-white rounded-lg shadow-sm"
                       onClick={() => {
                         sessionStorage.setItem('reviewSheetId', sheet.id);
                         onViewChange('goal-review');
                       }}
                     >
                       Review Action
                     </Button>
                   )}
                   {alertType === 'Review Needed' && <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg">View Details</Button>}
                   {alertType === 'Completed' && <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mr-4">Resolved</span>}
                 </div>
               );
             })}
             {allSheets.length === 0 && (
               <div className="p-12 text-center">
                 <p className="text-gray-500 font-medium">No recent alerts</p>
               </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPI({ value, label, color = "text-gray-900" }: { value: string, label: string, color?: string }) {
  return (
    <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow cursor-default relative overflow-hidden group">
      <CardContent className="p-6 relative z-10">
        <div className={`text-[32px] font-black tracking-tight mb-1 \${color}`}>{value}</div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
      </CardContent>
    </Card>
  );
}
