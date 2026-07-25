import React, { useState } from 'react';
import { NavTabId } from '../types';
import { useSyllabus } from '../context/SyllabusContext';
import { DashboardView } from './DashboardView';
import { SyllabusTrackerView } from './SyllabusTrackerView';
import { ReportModal } from './ReportModal';
import { 
  Sparkles,
  Flame,
  Calendar
} from 'lucide-react';

interface MainContentProps {
  activeTab: NavTabId;
}

export const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  const { streakDays, dDayDate } = useSyllabus();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Calculate remaining D-Day countdown dynamically
  const calculateDaysLeft = () => {
    if (!dDayDate) return null;
    const target = new Date(dDayDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft();

  return (
    <main className="flex-1 bg-gray-50 min-h-screen flex flex-col pb-20 md:pb-8 overflow-x-hidden">
      {/* Top Header */}
      <header className="min-h-20 bg-white border-b border-gray-200 px-4 sm:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div>
            <h1 id="welcome-header" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              UPSC CSE Mains Tracker
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Mains Preparation & Syllabus Command Center
            </p>
          </div>

          {/* Mobile/Tablet Header Streak Pill - Visible across all smaller screens */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-950 rounded-xl border border-amber-200 text-xs font-black shadow-2xs shrink-0">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-600 animate-pulse" />
            <span>{streakDays} {streakDays === 1 ? 'Day' : 'Days'} Streak</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
          {daysLeft !== null && (
            <div className="text-right px-3 py-1 border-r border-gray-100 hidden md:block">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3 text-indigo-500" />
                D-Day Target
              </p>
              <p className="text-xs font-mono text-indigo-600 font-black">
                {daysLeft > 0 ? `${daysLeft} DAYS LEFT` : daysLeft === 0 ? 'TARGET IS TODAY!' : `${Math.abs(daysLeft)} DAYS AGO`}
              </p>
            </div>
          )}

          <button 
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 font-bold rounded-xl text-xs sm:text-sm border border-indigo-100 transition-all duration-200 flex items-center gap-2 cursor-pointer hover:shadow-xs active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Generate Report</span>
          </button>
        </div>
      </header>

      {/* Dynamic View Body based on Active Tab */}
      <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">
        {activeTab === 'dashboard' && <DashboardView onOpenReportModal={() => setIsReportModalOpen(true)} />}
        {activeTab === 'syllabus' && <SyllabusTrackerView />}
      </div>

      {/* Official UPSC Progress Audit Report Modal */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </main>
  );
};



