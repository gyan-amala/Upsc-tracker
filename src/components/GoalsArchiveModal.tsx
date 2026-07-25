import React, { useState } from 'react';
import { useSyllabus } from '../context/SyllabusContext';
import { 
  Archive, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  X, 
  TrendingUp, 
  Award, 
  Clock, 
  BookOpen,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface GoalsArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalsArchiveModal: React.FC<GoalsArchiveModalProps> = ({ isOpen, onClose }) => {
  const { 
    dailyGoals, 
    restoreDailyGoal, 
    deleteDailyGoal, 
    clearArchivedGoals 
  } = useSyllabus();

  const [activeTab, setActiveTab] = useState<'all' | 'achieved' | 'unachieved'>('all');
  const [selectedPaper, setSelectedPaper] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter archived goals only
  const archivedGoals = dailyGoals.filter((goal) => goal.archived);

  // Stats calculation
  const totalArchived = archivedGoals.length;
  const totalAchieved = archivedGoals.filter((g) => g.completed).length;
  const totalUnachieved = archivedGoals.filter((g) => !g.completed).length;
  const successRate = totalArchived > 0 ? Math.round((totalAchieved / totalArchived) * 100) : 0;

  // Filtered archived list
  const filteredGoals = archivedGoals.filter((goal) => {
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'achieved' && goal.completed) ||
      (activeTab === 'unachieved' && !goal.completed);

    const matchesPaper = selectedPaper === 'all' || goal.paper === selectedPaper;

    const matchesSearch = 
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.paper.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesPaper && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-gray-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 text-white flex items-center justify-between gap-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-zinc-950 shadow-md">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Daily Goals Archive
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/10">
                  Historical Records
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Achieved &amp; Unachieved Daily Targets History
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Total Archived Card */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
              <div className="flex items-center justify-between text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Total Archived</span>
                <Archive className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">{totalArchived}</p>
              <p className="text-[10px] text-gray-500 font-medium">Logged study targets</p>
            </div>

            {/* Achieved Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
              <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                <span>Achieved Goals</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-950">{totalAchieved}</p>
              <p className="text-[10px] text-emerald-700 font-semibold">{successRate}% Completion Rate</p>
            </div>

            {/* Unachieved Card */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
              <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <span>Unachieved Goals</span>
                <XCircle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-950">{totalUnachieved}</p>
              <p className="text-[10px] text-amber-700 font-semibold">Targets missed / carried over</p>
            </div>

            {/* Success Rate Gauge */}
            <div className="p-4 rounded-2xl bg-indigo-900 text-white border border-indigo-800 space-y-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-200 text-[11px] font-bold uppercase tracking-wider">
                <span>Success Rate</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{successRate}%</p>
                <div className="w-full bg-indigo-950 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${successRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-200/80">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-zinc-900 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                All ({totalArchived})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('achieved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'achieved'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Achieved ({totalAchieved})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unachieved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'unachieved'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Unachieved ({totalUnachieved})</span>
              </button>
            </div>

            {/* Paper Filter & Search */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <select
                value={selectedPaper}
                onChange={(e) => setSelectedPaper(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">All Papers</option>
                <option value="GS I">GS I</option>
                <option value="GS II">GS II</option>
                <option value="GS III">GS III</option>
                <option value="GS IV">GS IV</option>
                <option value="Optional">Optional</option>
                <option value="Essay">Essay</option>
              </select>

              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Goals List */}
          {filteredGoals.length === 0 ? (
            <div className="p-10 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-2">
              <Archive className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-600">No Archived Goals Found</p>
              <p className="text-[11px] text-gray-400">
                {archivedGoals.length === 0
                  ? 'Move completed or past daily goals into archive to view historical records here.'
                  : 'No archived goals match your current tab or filter options.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    goal.completed
                      ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200'
                      : 'bg-amber-50/30 border-amber-100 hover:border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {goal.completed ? (
                        <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-lg bg-amber-100 text-amber-700">
                          <XCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            goal.completed
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {goal.completed ? 'Achieved' : 'Not Achieved'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200">
                          {goal.paper}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {goal.date}
                        </span>
                      </div>

                      <p className={`text-xs font-bold leading-relaxed ${
                        goal.completed ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {goal.title}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Restore or Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => restoreDailyGoal(goal.id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-indigo-600 border border-gray-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      title="Restore goal back to active Today's Goals"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to Today</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDailyGoal(goal.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Permanently Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer with Clear Archive option */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-500 font-medium">
            <span>Archive holds historical logs of all daily study targets</span>
          </div>

          <div className="flex items-center gap-3">
            {archivedGoals.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Archive</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Clear Archive */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-gray-200 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-gray-900">Clear All Archived Goals?</h3>
              <p className="text-xs text-gray-500">
                This will permanently delete all {archivedGoals.length} archived historical goal logs.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearArchivedGoals();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
