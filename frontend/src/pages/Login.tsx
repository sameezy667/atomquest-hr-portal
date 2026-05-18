import React, { useState } from 'react';
import { Target, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

const DEMO_USERS = [
  { label: 'Admin / HR', email: 'admin@atomq.com', role: 'admin' },
  { label: 'Manager', email: 'meera.k@atomq.com', role: 'manager' },
  { label: 'Employee', email: 'arun.m@atomq.com', role: 'employee' },
] as const;

const DEMO_PASSWORD = 'AtomQ@2026';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    }
  };

  const loginAsDemo = async (email: string) => {
    setDemoLoading(email);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: DEMO_PASSWORD,
    });

    setDemoLoading(null);

    if (error) {
      setError(`Demo login failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] mb-8">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-center text-[38px] font-black text-gray-900 tracking-tight mb-2">
          AtomQuest HR Portal
        </h2>
        <p className="text-center text-[15px] font-medium text-gray-500 max-w">
          Enterprise Performance Intelligence
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-10 px-4 sm:rounded-3xl sm:px-10 border-0 shadow-[0_4px_40px_-4px_rgba(0,0,0,0.05)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                Work Email
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 font-medium transition-colors sm:text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 font-medium transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-gray-50 text-gray-900 focus:ring-gray-200 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 text-[15px] shadow-sm"
              >
                {loading ? 'Signing in...' : (
                  <>
                    Sign in to workspace
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400 text-[10px] uppercase tracking-widest font-bold rounded-full">Demo Roles</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {DEMO_USERS.map(({ label, email }) => (
                <button
                  key={email}
                  onClick={() => loginAsDemo(email)}
                  disabled={!!demoLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {demoLoading === email ? '...' : label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
