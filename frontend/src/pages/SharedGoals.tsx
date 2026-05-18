import React, { useEffect, useState } from 'react';
import { View } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import {
  fetchSharedGoalGroups,
  fetchEmployeeSharedGoals,
  createSharedGoalGroup,
  assignSharedGoalMembers,
} from '../lib/api/sharedGoals';
import type { SharedGoalGroupWithMembers } from '../lib/api/sharedGoals';
import { LottieIcon } from '../components/ui/LottieIcon';
import { Plus, Users, Target, Calendar, TrendingUp, X } from 'lucide-react';

const CURRENT_YEAR = 2026;

export function SharedGoals({ onViewChange }: { onViewChange: (view: View) => void }) {
  const { profile, effectiveRole } = useAuthStore();
  const role = effectiveRole() || 'employee';
  const [loading, setLoading] = useState(true);
  const [sharedGoals, setSharedGoals] = useState<SharedGoalGroupWithMembers[]>([]);
  const [employeeGoals, setEmployeeGoals] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile?.id, role]);

  async function loadData() {
    if (!profile?.id) return;

    try {
      setLoading(true);

      if (role === 'employee') {
        // Employees see shared goals they're part of
        const goals = await fetchEmployeeSharedGoals(profile.id, CURRENT_YEAR);
        setEmployeeGoals(goals);
      } else {
        // Managers and admins see all shared goals
        const filters: any = { cycle_year: CURRENT_YEAR };
        if (role === 'manager') {
          filters.created_by = profile.id;
        }
        const goals = await fetchSharedGoalGroups(filters);
        setSharedGoals(goals);
      }
    } catch (error) {
      console.error('Error loading shared goals:', error);
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

  if (role === 'employee') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto relative z-10 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100 gap-4">
          <div>
            <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Shared Goals</h2>
            <p className="text-gray-500 mt-1 font-medium">Team goals you're collaborating on</p>
          </div>
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-5"
            onClick={() => onViewChange('dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>

        {employeeGoals.length === 0 ? (
          <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-50 mb-6 flex items-center justify-center border border-blue-100 shadow-sm mx-auto">
                <Users className="w-10 h-10 text-blue-500" />
              </div>
              <p className="font-bold text-gray-900 text-xl">No Shared Goals Yet</p>
              <p className="text-[15px] mt-2 text-gray-500 font-medium max-w-md mx-auto">
                You haven't been assigned to any shared team goals yet. Your manager will add you when team goals are created.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {employeeGoals.map((memberGoal: any) => {
              const group = memberGoal.group;
              return (
                <Card
                  key={memberGoal.id}
                  className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden"
                >
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-gray-900 text-lg font-bold mb-2">{group.title}</CardTitle>
                        <p className="text-sm text-gray-500">{group.description}</p>
                      </div>
                      {memberGoal.is_primary && (
                        <Badge className="bg-purple-50 text-purple-600 border-purple-200">Primary Owner</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 font-semibold">Thrust Area</span>
                        <p className="text-gray-900 font-bold mt-1">{group.thrust_area}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-semibold">Target</span>
                        <p className="text-gray-900 font-bold mt-1">{group.target || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-semibold">Your Weightage</span>
                        <p className="text-gray-900 font-bold mt-1">{memberGoal.weightage}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-semibold">Created By</span>
                        <p className="text-gray-900 font-bold mt-1">{group.creator?.full_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Manager/Admin view
  return (
    <div className="space-y-6 max-w-6xl mx-auto relative z-10 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100 gap-4">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Shared Goals</h2>
          <p className="text-gray-500 mt-1 font-medium">Create and manage team-wide objectives</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-5"
            onClick={() => onViewChange('dashboard')}
          >
            Return to Dashboard
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-900 hover:bg-black text-white rounded-xl px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Shared Goal
          </Button>
        </div>
      </div>

      {sharedGoals.length === 0 ? (
        <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-50 mb-6 flex items-center justify-center border border-purple-100 shadow-sm mx-auto">
              <Target className="w-10 h-10 text-purple-500" />
            </div>
            <p className="font-bold text-gray-900 text-xl">No Shared Goals Created</p>
            <p className="text-[15px] mt-2 text-gray-500 font-medium max-w-md mx-auto">
              Create shared goals to cascade objectives across your team. All members will track progress together.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 bg-gray-900 hover:bg-black text-white rounded-xl px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Shared Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sharedGoals.map((group) => (
            <Card
              key={group.id}
              className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden"
            >
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-gray-900 text-lg font-bold mb-2">{group.title}</CardTitle>
                    <p className="text-sm text-gray-500">{group.description}</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                    <Users className="w-3 h-3 mr-1" />
                    {group.members?.length || 0} Members
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                  <div>
                    <span className="text-gray-500 font-semibold">Thrust Area</span>
                    <p className="text-gray-900 font-bold mt-1">{group.thrust_area}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold">UOM Type</span>
                    <p className="text-gray-900 font-bold mt-1 uppercase">{group.uom_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold">Target</span>
                    <p className="text-gray-900 font-bold mt-1">{group.target || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold">Target Date</span>
                    <p className="text-gray-900 font-bold mt-1">
                      {group.target_date ? new Date(group.target_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {group.members && group.members.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Team Members</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {member.employee?.full_name || 'Unknown'}
                          </span>
                          {member.is_primary && (
                            <Badge className="bg-purple-50 text-purple-600 border-purple-200 text-xs">Primary</Badge>
                          )}
                          <span className="text-xs text-gray-500">{member.weightage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateSharedGoalModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Simple create modal (in production, this would be more sophisticated)
function CreateSharedGoalModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { profile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thrust_area: 'Revenue',
    uom_type: 'min' as 'min' | 'max' | 'timeline' | 'zero_based',
    target: '',
    target_date: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      setSaving(true);
      await createSharedGoalGroup({
        ...formData,
        target: formData.target ? parseFloat(formData.target) : null,
        target_date: formData.target_date || null,
        cycle_year: CURRENT_YEAR,
        created_by: profile.id,
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating shared goal:', error);
      alert('Failed to create shared goal. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border-0 bg-white rounded-[24px] shadow-2xl">
        <CardHeader className="border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900 text-xl font-bold">Create Shared Goal</CardTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., Increase Q2 Revenue by 25%"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="Describe the shared goal..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thrust Area *</label>
                <select
                  required
                  value={formData.thrust_area}
                  onChange={(e) => setFormData({ ...formData, thrust_area: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="Revenue">Revenue</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Quality">Quality</option>
                  <option value="Customer Satisfaction">Customer Satisfaction</option>
                  <option value="Innovation">Innovation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">UOM Type *</label>
                <select
                  required
                  value={formData.uom_type}
                  onChange={(e) => setFormData({ ...formData, uom_type: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="min">MIN (Higher is Better)</option>
                  <option value="max">MAX (Lower is Better)</option>
                  <option value="timeline">Timeline</option>
                  <option value="zero_based">Zero Based</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., 25"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Date</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1 bg-gray-900 hover:bg-black text-white rounded-xl">
                {saving ? 'Creating...' : 'Create Shared Goal'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
