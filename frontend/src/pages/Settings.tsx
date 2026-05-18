import React, { useState } from 'react';
import { View } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Briefcase, Building2, Bell, Shield } from 'lucide-react';

export function Settings({ onViewChange }: { onViewChange: (view: View) => void }) {
  const { profile } = useAuthStore();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative z-10 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-gray-100 gap-4">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-gray-900 leading-tight">Settings</h2>
          <p className="text-gray-500 mt-1 font-medium">Manage your account preferences and notifications.</p>
        </div>
        <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-5" onClick={() => onViewChange('dashboard')}>
          Return to Dashboard
        </Button>
      </div>

      {/* Profile Information */}
      <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-gray-900 text-lg font-bold">Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{profile?.full_name || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{profile?.email || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{profile?.designation || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 capitalize">{profile?.role || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Profile information is managed by your HR administrator. 
              Contact HR to update your details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle className="text-gray-900 text-lg font-bold">Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Receive email alerts for goal submissions, approvals, and check-in reminders
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">In-App Notifications</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Show notifications in the notification center within the portal
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={inAppNotifications}
                  onChange={(e) => setInAppNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              className="bg-gray-900 hover:bg-black text-white rounded-xl px-6"
              onClick={() => {
                // In a real app, this would save to database
                alert('Notification preferences saved successfully!');
              }}
            >
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="border-0 bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-gray-900 text-lg font-bold">System Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Portal Version</p>
              <p className="text-lg font-bold text-gray-900 mt-1">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Last Login</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Account Status</p>
              <p className="text-lg font-bold text-green-600 mt-1">Active</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Data Region</p>
              <p className="text-lg font-bold text-gray-900 mt-1">India</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
