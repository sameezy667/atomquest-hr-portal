import React, { useEffect, useState } from 'react';
import { View } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { LottieIcon } from '../components/ui/LottieIcon';
import { Search, Filter, Download } from 'lucide-react';

interface GoalSheet {
  id: string;
  employee_id: string;
  cycle_year: number;
  status: string;
  created_at: string;
  employee: {
    full_name: string;
    email: string;
    designation: string;
  };
  goals: Array<{
    id: string;
    title: string;
    thrust_area: string;
    weightage: number;
    uom_type: string;
  }>;
}

export function AdminGoals({ onViewChange }: { onViewChange: (view: View) => void }) {
  const [loading, setLoading] = useState(true);
  const [goalSheets, setGoalSheets] = useState<GoalSheet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadGoalSheets();
  }, []);

  async function loadGoalSheets() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('goal_sheets')
        .select(`
          id,
          employee_id,
          cycle_year,
          status,
          created_at,
          employee:profiles!goal_sheets_employee_id_fkey(
            full_name,
            email,
            designation
          ),
          goals(
            id,
            title,
            thrust_area,
            weightage,
            uom_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoalSheets(data as any);
    } catch (error) {
      console.error('Error loading goal sheets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSheets = goalSheets.filter(sheet => {
    const matchesSearch = sheet.employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sheet.employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sheet.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      submitted: 'bg-blue-100 text-blue-700 border-blue-200',
      under_review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      returned: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

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
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">All Goals</h2>
          <p className="text-gray-500 mt-1 font-medium">Organization-wide goal sheets and progress tracking.</p>
        </div>
        <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-5" onClick={() => onViewChange('dashboard')}>
          Return to Dashboard
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <CardContent className="p-6">
            <div className="text-3xl font-black text-gray-900">{goalSheets.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Goal Sheets</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <CardContent className="p-6">
            <div className="text-3xl font-black text-green-600">
              {goalSheets.filter(s => s.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Approved</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <CardContent className="p-6">
            <div className="text-3xl font-black text-blue-600">
              {goalSheets.filter(s => s.status === 'submitted' || s.status === 'under_review').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <CardContent className="p-6">
            <div className="text-3xl font-black text-gray-600">
              {goalSheets.reduce((sum, sheet) => sum + (sheet.goals?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Goals</div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Sheets List */}
      <div className="space-y-4">
        {filteredSheets.map((sheet) => (
          <Card key={sheet.id} className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-gray-900 text-lg font-bold">{sheet.employee.full_name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{sheet.employee.designation} • {sheet.employee.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusBadge(sheet.status)}>
                    {sheet.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500">FY{sheet.cycle_year}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Goals:</span>
                  <span className="font-semibold text-gray-900">{sheet.goals?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Weightage:</span>
                  <span className="font-semibold text-gray-900">
                    {sheet.goals?.reduce((sum, g) => sum + Number(g.weightage), 0) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(sheet.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {sheet.goals && sheet.goals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Goals:</p>
                  <div className="space-y-2">
                    {sheet.goals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 truncate flex-1">{goal.title}</span>
                        <span className="text-gray-500 ml-2">{goal.weightage}%</span>
                      </div>
                    ))}
                    {sheet.goals.length > 3 && (
                      <p className="text-sm text-gray-500">+ {sheet.goals.length - 3} more goals</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSheets.length === 0 && (
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <CardContent className="p-16 text-center">
            <LottieIcon name="empty" className="w-32 h-32 mx-auto" />
            <p className="font-bold text-gray-900 text-xl mt-4">No Goal Sheets Found</p>
            <p className="text-[15px] mt-2 text-gray-500 font-medium">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Goal sheets will appear here once employees create them'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
