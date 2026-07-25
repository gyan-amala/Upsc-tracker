import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useSyllabus } from '../context/SyllabusContext';
import { GoalsArchiveModal } from './GoalsArchiveModal';
import { ReportModal } from './ReportModal';
import { sanitizeHtml2CanvasColors } from '../utils/html2canvasSanitizer';
import { 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  CheckSquare,
  Camera,
  Loader2,
  Plus,
  BarChart3,
  FileText,
  RotateCcw,
  History,
  HelpCircle,
  PenTool,
  Settings,
  ArrowRight,
  Archive,
  Trash2,
  Inbox,
  Award
} from 'lucide-react';

interface PaperStat {
  id: string;
  code: string;
  title: string;
  percentage: number;
  badgeColor: string;
  barColor: string;
}

interface DashboardViewProps {
  onOpenReportModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenReportModal }) => {
  const { 
    syllabusData, 
    dDayDate, 
    dailyGoals, 
    addDailyGoal, 
    toggleDailyGoal, 
    deleteDailyGoal, 
    archiveDailyGoal, 
    archiveAllCompletedGoals, 
    archiveAllGoals 
  } = useSyllabus();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleOpenReport = () => {
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      setIsReportModalOpen(true);
    }
  };

  // Stats loading state
  const [isLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPaper, setNewTaskPaper] = useState('GS I');

  // Daily goals split
  const activeGoals = dailyGoals.filter((g) => !g.archived);
  const archivedGoals = dailyGoals.filter((g) => g.archived);
  const activeCompletedCount = activeGoals.filter((g) => g.completed).length;

  // D-Day calculation logic
  const calculateDDay = () => {
    if (!dDayDate) return { days: 0, formatted: '', isPast: false };
    const parts = dDayDate.split('-');
    if (parts.length !== 3) return { days: 0, formatted: dDayDate, isPast: false };
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    const target = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatted = target.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return { days, formatted, isPast: days < 0 };
  };

  const dDayInfo = calculateDDay();


  // Compute GS Papers data dynamically from real syllabusData
  const gsPaperConfigs = [
    {
      id: 'gs1',
      code: 'GS I',
      title: 'History, Culture, Geography & Society',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-100',
      barColor: 'bg-blue-600',
    },
    {
      id: 'gs2',
      code: 'GS II',
      title: 'Polity, Governance, Constitution & IR',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      barColor: 'bg-indigo-600',
    },
    {
      id: 'gs3',
      code: 'GS III',
      title: 'Economy, Sci-Tech, Environment & Security',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
      barColor: 'bg-amber-600',
    },
    {
      id: 'gs4',
      code: 'GS IV',
      title: 'Ethics, Integrity, Aptitude & Case Studies',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      barColor: 'bg-emerald-600',
    },
  ];

  const gsPapers: PaperStat[] = gsPaperConfigs.map((config) => {
    const paper = syllabusData.find((p) => p.id === config.id);
    if (!paper) return { ...config, percentage: 0 };

    const microthemes = paper.subjects.flatMap((s) => s.topics).flatMap((t) => t.microthemes);
    if (microthemes.length === 0) return { ...config, percentage: 0 };

    let totalFields = 0;
    let completedFields = 0;

    microthemes.forEach((mt) => {
      totalFields += 5;
      if (mt.progress?.notesCompleted) completedFields++;
      if (mt.progress?.revision1) completedFields++;
      if (mt.progress?.revision2) completedFields++;
      if (mt.progress?.pyqsDone) completedFields++;
      if (mt.progress?.answerWriting) completedFields++;
    });

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    return { ...config, percentage };
  });

  const STAGE_CONFIGS = [
    {
      key: 'notesCompleted' as const,
      label: 'Notes Completed',
      shortLabel: 'Notes',
      icon: FileText,
      barColor: 'bg-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-100',
    },
    {
      key: 'revision1' as const,
      label: '1st Revision',
      shortLabel: 'Rev 1',
      icon: RotateCcw,
      barColor: 'bg-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-100',
    },
    {
      key: 'revision2' as const,
      label: '2nd Revision',
      shortLabel: 'Rev 2',
      icon: History,
      barColor: 'bg-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-100',
    },
    {
      key: 'pyqsDone' as const,
      label: 'PYQs Solved',
      shortLabel: 'PYQs',
      icon: HelpCircle,
      barColor: 'bg-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-100',
    },
    {
      key: 'answerWriting' as const,
      label: 'Answer Writing',
      shortLabel: 'Answers',
      icon: PenTool,
      barColor: 'bg-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-100',
    },
  ];

  const paperStageBreakdown = gsPaperConfigs.map((config) => {
    const paper = syllabusData.find((p) => p.id === config.id);
    const microthemes = paper ? paper.subjects.flatMap((s) => s.topics).flatMap((t) => t.microthemes) : [];
    const totalTopics = microthemes.length;

    const stages = STAGE_CONFIGS.map((stage) => {
      const count = microthemes.filter((mt) => mt.progress?.[stage.key]).length;
      const percentage = totalTopics > 0 ? Math.round((count / totalTopics) * 100) : 0;
      return {
        ...stage,
        count,
        percentage,
      };
    });

    return {
      id: config.id,
      code: config.code,
      title: config.title,
      badgeColor: config.badgeColor,
      totalTopics,
      stages,
    };
  });

  const handleDownloadReport = async () => {
    const reportElement = document.getElementById('dashboard-progress-report');
    if (!reportElement) return;

    try {
      setIsGenerating(true);
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f9fafb',
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeHtml2CanvasColors(clonedDoc, 'dashboard-progress-report');
        },
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'UPSC_Progress_Report.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    } catch (error) {
      console.error('Failed to generate progress report image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addDailyGoal(newTaskTitle, newTaskPaper);
    setNewTaskTitle('');
  };

  // Calculate overall percentage from GS paper stats
  const totalPercentage = gsPapers.reduce((sum, p) => sum + p.percentage, 0);
  const overallPercentage = gsPapers.length > 0 ? Math.round(totalPercentage / gsPapers.length) : 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Success Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-zinc-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Progress Report Downloaded!</p>
            <p className="text-[10px] text-zinc-300">Saved as UPSC_Progress_Report.png</p>
          </div>
        </div>
      )}

      {/* Dashboard Top Header Bar with Download Report Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              UPSC Mains Command Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Mains Preparation Dashboard
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Track syllabus completion across GS papers and daily study goals
          </p>
        </div>

        {/* Top Right Download Report Button */}
        <button
          type="button"
          onClick={handleOpenReport}
          className="px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs hover:shadow-md active:scale-95 transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Download Report 📸</span>
        </button>
      </div>

      {/* Capturable Dashboard Grid Container */}
      <div id="dashboard-progress-report" className="space-y-8 bg-gray-50/50 p-2 sm:p-4 rounded-3xl border border-transparent">
        {/* Loading Skeletons vs Real Stats */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 animate-pulse">
            <div className="space-y-3 flex-1 w-full">
              <div className="h-5 w-40 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-64 bg-gray-200 rounded-xl"></div>
              <div className="h-4 w-full max-w-md bg-gray-100 rounded-lg"></div>
            </div>
            <div className="w-36 h-36 rounded-full bg-gray-100 border-8 border-gray-200 flex items-center justify-center shrink-0">
              <span className="text-xs text-gray-400 font-semibold">Loading...</span>
            </div>
          </div>
        ) : (
          /* Overall Syllabus Completion Banner */
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mains Preparation Overview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Overall Syllabus Completion
              </h2>
              <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
                Your cumulative progress across all General Studies papers (GS I, GS II, GS III, GS IV) towards CSE Mains.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-medium text-gray-600">
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Syllabus Status
                </span>
                <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 rounded-xl text-amber-950 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>D-Day Target: {dDayInfo.formatted}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    dDayInfo.isPast ? 'bg-rose-100 text-rose-900' : 'bg-amber-200/80 text-amber-950'
                  }`}>
                    {dDayInfo.isPast ? 'Passed' : `${dDayInfo.days} Days Left`}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Progress Meter */}
            <div className="relative flex items-center justify-center shrink-0 p-2">
              <svg className="w-44 h-44 transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="text-gray-100"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="text-indigo-600 transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {overallPercentage}%
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-0.5">
                  Completed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Today's Goals - Persistent Daily Task Engine with Archive */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Today's Daily Goals</h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Set daily study targets. Past days' goals automatically move to the Archive (whether achieved or not) so your daily list stays fresh.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {activeCompletedCount} of {activeGoals.length} completed
                </span>
              </div>

              {/* View Archive Button */}
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-amber-950 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Archive className="w-3.5 h-3.5 text-amber-600" />
                <span>Goals Archive</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-950 text-[10px] font-black">
                  {archivedGoals.length}
                </span>
              </button>
            </div>
          </div>

          {/* Add Goal Form */}
          <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new daily study target..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
            <select
              value={newTaskPaper}
              onChange={(e) => setNewTaskPaper(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="GS I">GS I</option>
              <option value="GS II">GS II</option>
              <option value="GS III">GS III</option>
              <option value="GS IV">GS IV</option>
              <option value="Optional">Optional</option>
              <option value="Essay">Essay</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </form>

          {/* Goal Items / Empty State */}
          {activeGoals.length === 0 ? (
            <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-2">
              <CheckSquare className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-600">No Active Daily Goals</p>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                Add study targets above for today. Once completed, archive them to store historical completion stats.
              </p>
              {archivedGoals.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  <Archive className="w-3 h-3" />
                  <span>View {archivedGoals.length} Archived Goals in History</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl transition-all border ${
                    goal.completed
                      ? 'bg-emerald-50/40 border-emerald-100/80 text-gray-600'
                      : 'bg-white hover:bg-gray-50/50 border-gray-100 text-gray-800'
                  }`}
                >
                  <div 
                    onClick={() => toggleDailyGoal(goal.id)}
                    className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-indigo-600 focus:outline-none shrink-0 cursor-pointer"
                      aria-label={goal.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {goal.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-500" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <span
                        className={`text-xs font-bold leading-relaxed block ${
                          goal.completed ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {goal.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${
                            goal.completed
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}
                        >
                          {goal.paper}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          Added: {goal.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Item Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={() => archiveDailyGoal(goal.id)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Archive this goal"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDailyGoal(goal.id)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Bulk Archiving Toolbar */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 text-xs">
                <span className="text-[11px] text-gray-500 font-medium">
                  Store finished goals into your long-term archive:
                </span>

                <div className="flex items-center gap-2">
                  {activeCompletedCount > 0 && (
                    <button
                      type="button"
                      onClick={archiveAllCompletedGoals}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Archive Completed ({activeCompletedCount})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={archiveAllGoals}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Inbox className="w-3.5 h-3.5 text-gray-600" />
                    <span>Archive All Goals for Today</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid of 4 GS Paper Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              General Studies Papers
            </h3>
            <span className="text-xs text-gray-400 font-medium">4 Core Papers</span>
          </div>

          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`skeleton-card-${i}`}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-14 bg-gray-200 rounded-xl"></div>
                    <div className="h-7 w-12 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-12 bg-gray-100 rounded-md"></div>
                      <div className="h-3 w-8 bg-gray-100 rounded-md"></div>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gray-200 h-full w-0"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* GS Paper Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {gsPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${paper.badgeColor}`}
                      >
                        {paper.code}
                      </span>
                      <span className="text-2xl font-black text-slate-900">
                        {paper.percentage}%
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                      {paper.title}
                    </h4>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1.5">
                      <span>Progress</span>
                      <span className="font-semibold text-gray-700">{paper.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${paper.barColor} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${paper.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paper-Wise Stage Trackers (Notes, Rev 1, Rev 2, PYQs, Answer Writing) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Paper-Wise Stage Trackers</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Completion percentages for Notes, 1st & 2nd Revisions, PYQs, and Answer Writing per GS Paper
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs self-start sm:self-auto">
              <span>5 Milestone Indicators</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paperStageBreakdown.map((paper) => (
              <div
                key={`stage-card-${paper.id}`}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all space-y-4"
              >
                {/* Paper Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${paper.badgeColor}`}>
                      {paper.code}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                      {paper.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 shrink-0">
                    {paper.totalTopics} {paper.totalTopics === 1 ? 'Topic' : 'Topics'}
                  </span>
                </div>

                {/* 5 Stages Breakdown List */}
                <div className="space-y-3.5">
                  {paper.stages.map((stage) => {
                    const StageIcon = stage.icon;
                    return (
                      <div key={stage.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-semibold text-gray-700">
                            <div className={`p-1 rounded-md ${stage.bgColor} ${stage.textColor}`}>
                              <StageIcon className="w-3.5 h-3.5" />
                            </div>
                            <span>{stage.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 font-mono">
                              {stage.count}/{paper.totalTopics}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${stage.bgColor} ${stage.textColor} border ${stage.borderColor}`}>
                              {stage.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`${stage.barColor} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${stage.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Archive & History Modal */}
      <GoalsArchiveModal 
        isOpen={isArchiveModalOpen} 
        onClose={() => setIsArchiveModalOpen(false)} 
      />

      {/* Report Modal */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
};
