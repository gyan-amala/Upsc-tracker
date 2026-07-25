import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSyllabus } from '../context/SyllabusContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap,
  Flame,
  User,
  Settings
} from 'lucide-react';

interface NavConfig {
  path: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavConfig[] = [
  { path: '/dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { path: '/syllabus', label: 'Syllabus Tracker', shortLabel: 'Syllabus', icon: BookOpen },
  { path: '/settings', label: 'Profile & Settings', shortLabel: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { userProfile, streakDays } = useSyllabus();
  return (
    <>
      {/* Desktop & Tablet Sidebar (Bento Grid dark theme: bg-zinc-950) */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-400 select-none shrink-0 h-screen sticky top-0 justify-between">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs transition-transform hover:scale-105">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-zinc-100 font-semibold text-base tracking-tight block leading-tight">UPSC CSE Mains Tracker</span>
                <span className="text-[11px] text-zinc-500 font-medium">Mains Preparation</span>
              </div>
            </div>
          </div>

          {/* Daily Streak Counter Widget */}
          <div className="mx-4 my-3 p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between shadow-xs transition-all hover:border-amber-500/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                <Flame className="w-5 h-5 fill-amber-400 text-amber-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-extrabold text-white tracking-tight">{streakDays} {streakDays === 1 ? 'Day' : 'Days'} Streak</span>
                </div>
                <p className="text-[10px] text-amber-200/80 font-medium">Daily Mains Practice</p>
              </div>
            </div>
            <div className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold rounded-full border border-amber-500/30 uppercase tracking-wider shrink-0">
              🔥 HOT
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="p-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold text-zinc-600 tracking-wider uppercase">
              Core Modules
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/80 active:scale-[0.98]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500 opacity-70 hover:opacity-100'}`} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Aspirant Profile Card */}
        <div className="p-4 border-t border-zinc-900">
          <Link 
            to="/settings"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all uppercase">
                {userProfile?.name ? userProfile.name.slice(0, 2) : 'UT'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                  {userProfile?.name || 'Mains Aspirant'}
                </p>
                <p className="text-[10px] text-indigo-400 truncate group-hover:text-indigo-300 font-medium">
                  {userProfile?.targetAttemptYear ? `CSE ${userProfile.targetAttemptYear}` : 'Target Goal'} • Settings
                </p>
              </div>
            </div>
            <Settings className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 text-zinc-500 z-50 flex items-center justify-around px-1 py-2 shadow-lg select-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] min-w-[56px] transition-all duration-150 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'text-white font-semibold bg-zinc-800/80 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 mb-0.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span className="truncate max-w-[64px] text-[10px]">{item.shortLabel || item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

