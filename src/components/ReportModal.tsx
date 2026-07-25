import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useSyllabus } from '../context/SyllabusContext';
import { sanitizeHtml2CanvasColors } from '../utils/html2canvasSanitizer';
import { 
  X, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  History, 
  HelpCircle, 
  PenTool, 
  TrendingUp, 
  Clock, 
  CheckSquare,
  Loader2,
  Target
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, streakDays, dDayDate, syllabusData, dailyGoals } = useSyllabus();
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Compute Current Date and Report ID
  const todayDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const reportRefId = `CSE-${userProfile.targetAttemptYear || '2026'}-RPT-${Math.floor(1000 + Math.random() * 9000)}`;

  // D-Day Days Left
  const calculateDDay = () => {
    if (!dDayDate) return { days: 0, formatted: 'Not set', isPast: false };
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

  // Paper Configs & Metrics
  const paperConfigs = [
    { id: 'gs1', code: 'GS I', title: 'History, Culture, Geography & Society' },
    { id: 'gs2', code: 'GS II', title: 'Polity, Governance, Constitution & IR' },
    { id: 'gs3', code: 'GS III', title: 'Economy, Sci-Tech, Environment & Security' },
    { id: 'gs4', code: 'GS IV', title: 'Ethics, Integrity, Aptitude & Case Studies' },
    { id: 'essay', code: 'Essay', title: 'Essay Paper' },
    { id: 'optional', code: 'Optional', title: `Optional Subject (${userProfile.optionalSubject || 'Geography'})` },
  ];

  let totalMilestonesPossible = 0;
  let totalMilestonesAchieved = 0;
  let notesTotal = 0, rev1Total = 0, rev2Total = 0, pyqTotal = 0, answerTotal = 0;
  let totalTopicsOverall = 0;

  const paperDetails = paperConfigs.map((config) => {
    const paper = syllabusData.find((p) => p.id === config.id);
    const microthemes = paper ? paper.subjects.flatMap((s) => s.topics).flatMap((t) => t.microthemes) : [];
    const totalTopics = microthemes.length;

    let notes = 0, rev1 = 0, rev2 = 0, pyqs = 0, answers = 0;

    microthemes.forEach((mt) => {
      if (mt.progress?.notesCompleted) notes++;
      if (mt.progress?.revision1) rev1++;
      if (mt.progress?.revision2) rev2++;
      if (mt.progress?.pyqsDone) pyqs++;
      if (mt.progress?.answerWriting) answers++;
    });

    const totalFields = totalTopics * 5;
    const completedFields = notes + rev1 + rev2 + pyqs + answers;
    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    totalMilestonesPossible += totalFields;
    totalMilestonesAchieved += completedFields;
    notesTotal += notes;
    rev1Total += rev1;
    rev2Total += rev2;
    pyqTotal += pyqs;
    answerTotal += answers;
    totalTopicsOverall += totalTopics;

    return {
      ...config,
      totalTopics,
      percentage,
      notes,
      rev1,
      rev2,
      pyqs,
      answers,
    };
  });

  const overallPercentage = totalMilestonesPossible > 0
    ? Math.round((totalMilestonesAchieved / totalMilestonesPossible) * 100)
    : 0;

  const activeGoalsCount = dailyGoals.filter((g) => !g.archived).length;
  const completedGoalsCount = dailyGoals.filter((g) => g.completed).length;

  // Image Download Handler
  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          sanitizeHtml2CanvasColors(clonedDoc, 'printable-upsc-report');
        },
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `UPSC_CSE_Mains_Report_${userProfile.targetAttemptYear || '2026'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export report image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Header Bar (Hidden in Print) */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-zinc-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Official UPSC CSE Mains Progress Report
              </h3>
              <p className="text-[11px] text-zinc-400">
                High-definition presentable candidate performance audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadImage}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Image HD</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50 print:p-0 print:bg-white print:overflow-visible">
          <div
            ref={reportRef}
            id="printable-upsc-report"
            className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200/80 shadow-xs space-y-8 max-w-3xl mx-auto print:max-w-none print:border-none print:shadow-none print:p-0"
            style={{ color: '#18181b', backgroundColor: '#ffffff' }}
          >
            {/* Header / Brand Banner */}
            <div className="border-b-2 border-indigo-600 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest">
                    VERIFIED CANDIDATE AUDIT
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gray-500">
                    Ref: {reportRefId}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  UPSC CSE Mains Preparation Report
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Syllabus Coverage, Revision Matrix &amp; Performance Audit
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-gray-600 font-medium space-y-0.5 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100">
                <p className="font-bold text-indigo-950 flex items-center gap-1 sm:justify-end">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Report Date:</span>
                </p>
                <p className="font-mono text-gray-900 font-bold">{todayDateStr}</p>
                <p className="text-[10px] text-indigo-700 font-semibold pt-0.5">
                  UPSC CSE Mains Tracker • Official Export
                </p>
              </div>
            </div>

            {/* Candidate Details Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">
                    Candidate Profile
                  </span>
                  <h2 className="text-xl font-extrabold text-white">
                    {userProfile.name || 'Mains Aspirant'}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-700/60 px-3 py-1.5 rounded-xl text-indigo-200 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Stage: {userProfile.preparationStage || 'Mains Focus'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Target CSE</span>
                  <p className="font-extrabold text-amber-400 text-sm">CSE {userProfile.targetAttemptYear || '2026'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Optional Subject</span>
                  <p className="font-bold text-white text-sm truncate">{userProfile.optionalSubject || 'Geography'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Daily Study Target</span>
                  <p className="font-bold text-indigo-300 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{userProfile.dailyStudyTargetHours || 8} Hrs/Day</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Study Streak</span>
                  <p className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{streakDays || 0} Days Active</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Key KPI Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Overall Completion
                </span>
                <p className="text-3xl font-black text-indigo-950">{overallPercentage}%</p>
                <span className="text-[10px] text-indigo-600 font-medium block">Across All GS &amp; Optional</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  D-Day Countdown
                </span>
                <p className="text-2xl font-black text-amber-950">
                  {dDayInfo.isPast ? 'Exam Over' : `${dDayInfo.days} Days`}
                </p>
                <span className="text-[10px] text-amber-700 font-medium block">{dDayInfo.formatted}</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Milestones Achieved
                </span>
                <p className="text-2xl font-black text-emerald-950">
                  {totalMilestonesAchieved} / {totalMilestonesPossible}
                </p>
                <span className="text-[10px] text-emerald-700 font-medium block">Completed Checkpoints</span>
              </div>

              <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                  Daily Goals Tracked
                </span>
                <p className="text-2xl font-black text-purple-950">
                  {completedGoalsCount} / {activeGoalsCount}
                </p>
                <span className="text-[10px] text-purple-700 font-medium block">Active Tasks Finished</span>
              </div>
            </div>

            {/* 5 Milestone Totals Summary Bar */}
            <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Cumulative Preparation Milestone Totals</span>
                </h3>
                <span className="text-[11px] font-bold text-gray-500">
                  {totalTopicsOverall} Syllabus Topics Total
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <FileText className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 font-bold">Notes Made</p>
                  <p className="text-base font-black text-gray-900">{notesTotal}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <RotateCcw className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 font-bold">1st Revision</p>
                  <p className="text-base font-black text-gray-900">{rev1Total}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <History className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 font-bold">2nd Revision</p>
                  <p className="text-base font-black text-gray-900">{rev2Total}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <HelpCircle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 font-bold">PYQs Solved</p>
                  <p className="text-base font-black text-gray-900">{pyqTotal}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <PenTool className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 font-bold">Answers Written</p>
                  <p className="text-base font-black text-gray-900">{answerTotal}</p>
                </div>
              </div>
            </div>

            {/* GS & Optional Papers Table Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Paper-Wise Syllabus Breakdown</span>
                </h3>
                <span className="text-xs text-gray-500 font-semibold">Detailed Audit Table</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100/80 text-gray-700 font-black border-b border-gray-200">
                      <th className="p-3">Paper</th>
                      <th className="p-3">Title / Subject</th>
                      <th className="p-3 text-center">Progress</th>
                      <th className="p-3 text-center">Notes</th>
                      <th className="p-3 text-center">Rev 1</th>
                      <th className="p-3 text-center">Rev 2</th>
                      <th className="p-3 text-center">PYQs</th>
                      <th className="p-3 text-center">Answers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {paperDetails.map((paper) => (
                      <tr key={`rpt-paper-${paper.id}`} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 font-extrabold text-indigo-900 whitespace-nowrap">
                          {paper.code}
                        </td>
                        <td className="p-3 font-medium text-gray-900 max-w-xs leading-snug">
                          {paper.title}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-md font-black text-indigo-700 bg-indigo-50 border border-indigo-100">
                            {paper.percentage}%
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-gray-700">{paper.notes}/{paper.totalTopics}</td>
                        <td className="p-3 text-center font-mono font-bold text-gray-700">{paper.rev1}/{paper.totalTopics}</td>
                        <td className="p-3 text-center font-mono font-bold text-gray-700">{paper.rev2}/{paper.totalTopics}</td>
                        <td className="p-3 text-center font-mono font-bold text-gray-700">{paper.pyqs}/{paper.totalTopics}</td>
                        <td className="p-3 text-center font-mono font-bold text-gray-700">{paper.answers}/{paper.totalTopics}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Insights & Guidance Note */}
            <div className="bg-gradient-to-r from-indigo-900 to-zinc-900 text-white p-5 rounded-2xl shadow-sm border border-indigo-800 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="text-xs font-extrabold tracking-tight uppercase text-amber-300">
                  Performance &amp; Preparation Strategy Advice
                </h4>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                {overallPercentage >= 60 ? (
                  <>You have achieved high syllabus coverage ({overallPercentage}%). Keep focusing on <strong>2nd Revision cycles</strong> and <strong>timed Mains Answer Writing</strong> to consolidate high scoring potential in GS IV Ethics &amp; Optional papers.</>
                ) : overallPercentage >= 30 ? (
                  <>Good steady pace ({overallPercentage}% completed). Focus on completing initial <strong>Notes &amp; 1st Revisions</strong> for remaining GS II and GS III core sub-topics while maintaining daily target hours.</>
                ) : (
                  <>Syllabus coverage is in its early stages ({overallPercentage}%). Prioritize high-yield core sub-topics in GS I (Modern History &amp; Geography) and GS II Polity, and log daily target hours regularly.</>
                )}
              </p>
            </div>

            {/* Document Signature & Watermark Footer */}
            <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 gap-2">
              <div className="flex items-center gap-1.5 font-bold text-gray-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>UPSC CSE Mains Tracker • Official Candidate Analytics</span>
              </div>
              <p className="font-mono text-gray-400">
                Page 1 of 1 • Strictly Confidential Progress Audit
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
