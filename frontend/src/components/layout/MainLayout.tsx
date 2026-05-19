import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Target as TargetShare, // Shared goals
  CheckCircle,
  FileText,
  BarChart2,
  ListOrdered,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  LayoutGrid,
  Sun,
  Moon,
  User,
  X
} from 'lucide-react';
import { Role, View } from '../../App';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface MainLayoutProps {
  children: React.ReactNode;
  role: Role;
  onRoleChange: (role: Role) => void;
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

export function MainLayout({ children, role, onRoleChange, currentView, onViewChange, onLogout }: MainLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const { profile } = useAuthStore();

  useEffect(() => {
    // Check initial preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);
    setShowSearchResults(true);

    try {
      // Search goals
      const { data: goals, error } = await supabase
        .from('goals')
        .select(`
          id,
          title,
          thrust_area,
          target,
          sheet_id,
          goal_sheets!inner (
            employee_id,
            cycle_year,
            employee:profiles!goal_sheets_employee_id_fkey (
              full_name
            )
          )
        `)
        .ilike('title', `%${query}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(goals || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const getNavItems = () => {
    const base = [
      { id: 'dashboard', label: 'Home', icon: LayoutGrid },
    ];
    
    if (role === 'employee') {
      base.push(
        { id: 'goal-editor', label: 'My Goal Sheet', icon: Target },
        { id: 'check-ins', label: 'Check-ins', icon: CheckCircle },
        { id: 'shared-goals', label: 'Shared Goals', icon: TargetShare }
      );
    } else if (role === 'manager') {
      base.push(
        { id: 'goal-review', label: 'Team Goals', icon: Target },
        { id: 'check-ins', label: 'Team Check-ins', icon: CheckCircle },
        { id: 'shared-goals', label: 'Shared Goals', icon: TargetShare },
        { id: 'reports', label: 'Team Reports', icon: FileText }
      );
    } else if (role === 'admin') {
      base.push(
        { id: 'goals', label: 'All Goals', icon: Target },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'audit', label: 'Audit Logs', icon: ListOrdered },
        { id: 'settings', label: 'Settings', icon: Settings }
      );
    }
    
    return base as { id: View; label: string; icon: React.ElementType }[];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen w-full bg-transparent text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[260px] bg-gray-950 text-gray-400 flex flex-col items-stretch flex-shrink-0 z-20">
        
        <div className="h-20 flex items-center px-8 relative z-10 w-full mb-4">
          <div className="flex items-center gap-3 text-white w-full">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-950 font-bold text-lg leading-none">
              A
            </div>
            <span className="font-bold text-xl tracking-tight leading-none mt-1">AtomQ HR</span>
          </div>
        </div>

        <div className="px-6 py-2 flex-1 overflow-y-auto relative z-10 scrollbar-hide space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "text-white bg-white/10 font-semibold" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white font-medium"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px] transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300")} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-2 mb-6">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 font-medium w-full relative"
            >
              <Bell className="w-[18px] h-[18px]" />
              Notifications
              <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 font-medium w-full"
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button 
              onClick={() => onViewChange('settings')}
              className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 font-medium w-full"
            >
              <Settings className="w-[18px] h-[18px]" />
              Settings
            </button>
          </div>

          {/* Notifications Panel */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-50" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="fixed right-6 top-24 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div 
                    className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowNotifications(false);
                      onViewChange('dashboard');
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Goal Sheet Approved</p>
                        <p className="text-xs text-gray-500 mt-1">Your Q2 2026 goals have been approved by your manager</p>
                        <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowNotifications(false);
                      onViewChange('check-ins');
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Check-in Reminder</p>
                        <p className="text-xs text-gray-500 mt-1">Weekly check-in is due tomorrow</p>
                        <p className="text-xs text-gray-400 mt-2">1 day ago</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowNotifications(false);
                      onViewChange('shared-goals');
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">New Shared Goal</p>
                        <p className="text-xs text-gray-500 mt-1">You've been added to "Q2 Product Launch" shared goal</p>
                        <p className="text-xs text-gray-400 mt-2">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      onViewChange('dashboard');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            </>
          )}

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-24 flex items-center justify-between px-10 flex-shrink-0 z-10 w-full mt-2">
          
          <div className="flex items-center gap-8 w-full max-w-4xl">
            <h1 className="text-[28px] font-bold capitalize text-gray-900 tracking-tight flex items-center gap-3 w-64 flex-shrink-0">
              {currentView.replace('-', ' ')}
            </h1>
            
            {/* Search - prominent pill shape */}
            <div className="hidden md:flex relative flex-1 max-w-xl group">
              <div className="relative flex items-center w-full">
                <Search className="w-[18px] h-[18px] absolute left-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search goals..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-[15px] transition-all outline-none focus:border-gray-300 shadow-sm text-gray-800 placeholder-gray-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="absolute right-5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSearchResults(false)}
                  />
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    {searching ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Goals ({searchResults.length})
                        </div>
                        {searchResults.map((goal: any) => (
                          <button
                            key={goal.id}
                            onClick={() => {
                              // Navigate to goal editor or review based on role
                              if (role === 'employee') {
                                onViewChange('goal-editor');
                              } else {
                                sessionStorage.setItem('reviewSheetId', goal.sheet_id);
                                onViewChange('goal-review');
                              }
                              setShowSearchResults(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <p className="text-sm font-semibold text-gray-900">{goal.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{goal.thrust_area}</span>
                              {goal.goal_sheets?.employee?.full_name && (
                                <>
                                  <span className="text-xs text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">{goal.goal_sheets.employee.full_name}</span>
                                </>
                              )}
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No goals found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => window.open('https://meet.google.com/new', '_blank')}
              className="flex items-center gap-2 bg-gray-900 text-white hover:bg-black px-5 py-2.5 rounded-full transition-all duration-300 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <span className="text-sm">Start Meeting</span>
              <div className="w-2 h-2 rounded-full bg-white ml-2"></div>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden ml-2 flex-shrink-0 hover:border-gray-300 transition-colors"
              >
                <img src="https://i.pravatar.cc/150?1" alt="User" className="w-full h-full object-cover" />
              </button>
              
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{profile?.email || 'user@atomq.com'}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{role}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        onViewChange('settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        onViewChange('settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        toggleTheme();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-10 pb-12 pt-2 relative">
          <div className="w-full max-w-6xl animate-slide-up mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

