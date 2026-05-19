import React, { useEffect, useState } from 'react';
import { View } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { LottieIcon } from '../components/ui/LottieIcon';
import { Download, FileText, Calendar, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportData {
  totalEmployees: number;
  totalGoalSheets: number;
  approvedSheets: number;
  pendingSheets: number;
  totalGoals: number;
  avgGoalsPerEmployee: number;
  completionRate: number;
}

export function AdminReports({ onViewChange }: { onViewChange: (view: View) => void }) {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    loadReportData();
  }, [selectedYear]);

  async function loadReportData() {
    try {
      setLoading(true);

      // Get all goal sheets for the year
      const { data: sheets, error: sheetsError } = await supabase
        .from('goal_sheets')
        .select(`
          id,
          status,
          employee_id,
          goals(id)
        `)
        .eq('cycle_year', selectedYear);

      if (sheetsError) throw sheetsError;

      // Get total employees
      const { count: employeeCount, error: employeeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .neq('role', 'admin');

      if (employeeError) throw employeeError;

      const totalGoals = sheets?.reduce((sum, sheet) => sum + (sheet.goals?.length || 0), 0) || 0;
      const approvedCount = sheets?.filter(s => s.status === 'approved').length || 0;
      const pendingCount = sheets?.filter(s => s.status === 'submitted' || s.status === 'under_review').length || 0;

      setReportData({
        totalEmployees: employeeCount || 0,
        totalGoalSheets: sheets?.length || 0,
        approvedSheets: approvedCount,
        pendingSheets: pendingCount,
        totalGoals,
        avgGoalsPerEmployee: sheets?.length ? totalGoals / sheets.length : 0,
        completionRate: employeeCount ? (approvedCount / employeeCount) * 100 : 0,
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportToExcel() {
    try {
      // Fetch detailed data
      const { data: sheets, error } = await supabase
        .from('goal_sheets')
        .select(`
          id,
          cycle_year,
          status,
          created_at,
          approved_at,
          employee:profiles!goal_sheets_employee_id_fkey(
            full_name,
            email,
            designation,
            department:departments!profiles_department_id_fkey(name)
          ),
          goals(
            title,
            thrust_area,
            weightage,
            uom_type,
            target
          )
        `)
        .eq('cycle_year', selectedYear);

      if (error) throw error;

      // Prepare data for Excel
      const excelData = sheets?.flatMap(sheet => 
        sheet.goals?.map((goal: any) => ({
          'Employee Name': sheet.employee.full_name,
          'Email': sheet.employee.email,
          'Designation': sheet.employee.designation,
          'Department': sheet.employee.department?.name || 'N/A',
          'Sheet Status': sheet.status,
          'Goal Title': goal.title,
          'Thrust Area': goal.thrust_area,
          'Weightage (%)': goal.weightage,
          'UOM Type': goal.uom_type,
          'Target': goal.target || 'N/A',
          'Created Date': new Date(sheet.created_at).toLocaleDateString(),
          'Approved Date': sheet.approved_at ? new Date(sheet.approved_at).toLocaleDateString() : 'N/A',
        })) || []
      ) || [];

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Goals FY${selectedYear}`);

      // Download
      XLSX.writeFile(wb, `AtomQuest_Goals_Report_FY${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export report. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LottieIcon name="loading" className="w-32 h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative z-10 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100 gap-4">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Reports</h2>
          <p className="text-gray-500 mt-1 font-medium">Generate and export organizational performance reports.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value={2026}>FY 2026</option>
            <option value={2025}>FY 2025</option>
            <option value={2024}>FY 2024</option>
          </select>
          <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-5" onClick={() => onViewChange('dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
          <CardContent className="p-6 text-white">
            <Users className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-black">{reportData?.totalEmployees || 0}</div>
            <div className="text-sm opacity-90 mt-1">Total Employees</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
          <CardContent className="p-6 text-white">
            <FileText className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-black">{reportData?.approvedSheets || 0}</div>
            <div className="text-sm opacity-90 mt-1">Approved Goal Sheets</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
          <CardContent className="p-6 text-white">
            <Calendar className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-black">{reportData?.pendingSheets || 0}</div>
            <div className="text-sm opacity-90 mt-1">Pending Review</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
          <CardContent className="p-6 text-white">
            <FileText className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-black">{reportData?.totalGoals || 0}</div>
            <div className="text-sm opacity-90 mt-1">Total Goals</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-gray-900 text-lg font-bold">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-2">Completion Rate</div>
              <div className="text-3xl font-black text-gray-900">
                {reportData?.completionRate.toFixed(1)}%
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${reportData?.completionRate || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">Avg Goals per Employee</div>
              <div className="text-3xl font-black text-gray-900">
                {reportData?.avgGoalsPerEmployee.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Target: 5-8 goals per employee
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">Goal Sheets Created</div>
              <div className="text-3xl font-black text-gray-900">
                {reportData?.totalGoalSheets || 0}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Out of {reportData?.totalEmployees || 0} employees
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-gray-900 text-lg font-bold">Export Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900">Complete Goals Report</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Export all goal sheets with employee details, goals, and status
                </p>
              </div>
              <Button 
                onClick={exportToExcel}
                className="bg-gray-900 hover:bg-black text-white rounded-xl px-6"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 opacity-60">
              <div>
                <h3 className="font-semibold text-gray-900">Quarterly Progress Report</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Export quarterly achievements and progress scores
                </p>
              </div>
              <Button 
                disabled
                className="bg-gray-300 text-gray-500 rounded-xl px-6 cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 opacity-60">
              <div>
                <h3 className="font-semibold text-gray-900">Department Summary</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Export department-wise performance summary
                </p>
              </div>
              <Button 
                disabled
                className="bg-gray-300 text-gray-500 rounded-xl px-6 cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
