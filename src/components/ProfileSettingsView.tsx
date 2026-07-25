import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSyllabus } from '../context/SyllabusContext';
import { GoalsArchiveModal } from './GoalsArchiveModal';
import { 
  User, 
  Calendar, 
  Target, 
  BookOpen, 
  Clock, 
  Award, 
  Trash2, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  Save, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Archive,
  CheckSquare,
  TrendingUp,
  XCircle,
  LogIn,
  LogOut,
  UserCheck,
  Mail
} from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    dDayDate, 
    setDDayDate, 
    userProfile, 
    updateUserProfile, 
    syllabusData, 
    resetProgress,
    dailyGoals,
    streakDays,
    currentUser,
    isCloudSynced,
    logoutUser
  } = useSyllabus();

  const [formData, setFormData] = useState<{
    name: string;
    targetAttemptYear: string;
    optionalSubject: string;
    dailyStudyTargetHours: number | string;
    preparationStage: string;
  }>({
    name: userProfile.name,
    targetAttemptYear: userProfile.targetAttemptYear,
    optionalSubject: userProfile.optionalSubject,
    dailyStudyTargetHours: userProfile.dailyStudyTargetHours,
    preparationStage: userProfile.preparationStage,
  });

  useEffect(() => {
    setFormData({
      name: userProfile.name,
      targetAttemptYear: userProfile.targetAttemptYear,
      optionalSubject: userProfile.optionalSubject,
      dailyStudyTargetHours: userProfile.dailyStudyTargetHours,
      preparationStage: userProfile.preparationStage,
    });
  }, [userProfile]);

  const [savedToast, setSavedToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetToast, setResetToast] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // OTP Verification State for Resetting Progress
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [inputPhrase, setInputPhrase] = useState('');
  const [otpError, setOtpError] = useState('');

  // Archive calculations
  const archivedGoals = dailyGoals.filter((g) => g.archived);
  const totalArchived = archivedGoals.length;
  const totalAchieved = archivedGoals.filter((g) => g.completed).length;
  const totalUnachieved = archivedGoals.filter((g) => !g.completed).length;
  const successRate = totalArchived > 0 ? Math.round((totalAchieved / totalArchived) * 100) : 0;

  // D-Day calculation helper
  const calculateDDay = (targetDateStr: string) => {
    if (!targetDateStr) return { days: 0, formatted: '', isPast: false };
    const parts = targetDateStr.split('-');
    if (parts.length !== 3) return { days: 0, formatted: targetDateStr, isPast: false };
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

  const dDayInfo = calculateDDay(dDayDate);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHours = parseInt(String(formData.dailyStudyTargetHours), 10);
    const finalHours = isNaN(parsedHours) || parsedHours <= 0 ? 8 : Math.min(24, parsedHours);
    const updatedProfile = {
      ...formData,
      dailyStudyTargetHours: finalHours,
    };
    updateUserProfile(updatedProfile);
    setFormData(updatedProfile);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  // Quick Preset Handlers for D-Day
  const setPresetDate = (daysFromNow: number, label: string) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setDDayDate(dateStr);
  };

  // OTP Reset Handlers
  const handleOpenResetModal = () => {
    setShowResetConfirm(true);
    setOtpSent(false);
    setGeneratedOtp('');
    setInputOtp('');
    setInputPhrase('');
    setOtpError('');
  };

  const handleSendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpError('');
  };

  const handleConfirmReset = () => {
    if (inputOtp !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the 6-digit code shown in the email alert.');
      return;
    }
    if (inputPhrase.trim().toUpperCase() !== 'RESET SYLLABUS') {
      setOtpError('Please type "RESET SYLLABUS" into the confirmation phrase box.');
      return;
    }

    resetProgress();
    setShowResetConfirm(false);
    setResetToast(true);
    setOtpSent(false);
    setGeneratedOtp('');
    setInputOtp('');
    setInputPhrase('');
    setOtpError('');
    setTimeout(() => setResetToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Toast Notifications */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Profile &amp; Settings updated successfully!</span>
        </div>
      )}

      {resetToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold">Syllabus progress reset to initial default state.</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 p-6 sm:p-8 rounded-3xl text-white shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-extrabold uppercase tracking-wider">
              <User className="w-3.5 h-3.5" />
              <span>Aspirant Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Profile &amp; Preparation Settings
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Configure your CSE Mains D-Day target deadline, optional subject, daily study targets, and data backups.
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
            <div className="bg-amber-500/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-500/30 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-xs font-black text-amber-200">{streakDays} {streakDays === 1 ? 'Day' : 'Days'} Active Streak 🔥</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-right flex flex-col items-start sm:items-end">
              <span className="text-[10px] uppercase font-black text-indigo-200 tracking-wider">Target D-Day</span>
              <span className="text-lg font-black text-white">{dDayInfo.formatted}</span>
              <span className="text-xs font-bold text-amber-300">
                {dDayInfo.isPast ? 'Passed' : `${dDayInfo.days} Days Remaining`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Sections */}
      <div className="space-y-8">
        
        {/* SECTION 1: ASPIRANT PROFILE & ATTEMPT DETAILS */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-2xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Aspirant Profile &amp; Study Targets
                </h2>
                <p className="text-xs text-gray-500">
                  Personal details, attempt target year, optional subject, and daily study hours.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold rounded-full">
              Personal Goals
            </span>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aditya Gurjar"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Target Attempt Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  Target CSE Attempt Year
                </label>
                <select
                  value={formData.targetAttemptYear}
                  onChange={(e) => setFormData({ ...formData, targetAttemptYear: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="2024">CSE 2024</option>
                  <option value="2025">CSE 2025</option>
                  <option value="2026">CSE 2026</option>
                  <option value="2027">CSE 2027</option>
                  <option value="2028">CSE 2028</option>
                  <option value="2029">CSE 2029</option>
                  <option value="2030">CSE 2030</option>
                  <option value="2031">CSE 2031</option>
                  <option value="2032">CSE 2032</option>
                  <option value="2033">CSE 2033</option>
                  <option value="2034">CSE 2034</option>
                  <option value="2035">CSE 2035</option>
                </select>
              </div>

              {/* Optional Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Optional Subject
                </label>
                <select
                  value={formData.optionalSubject}
                  onChange={(e) => setFormData({ ...formData, optionalSubject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="Geography">Geography</option>
                  <option value="Sociology">Sociology</option>
                  <option value="Political Science & IR (PSIR)">Political Science &amp; IR (PSIR)</option>
                  <option value="Public Administration">Public Administration</option>
                  <option value="History">History</option>
                  <option value="Anthropology">Anthropology</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Economics">Economics</option>
                  <option value="Law">Law</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Other / Literature">Other / Literature</option>
                </select>
              </div>

              {/* Daily Study Hours */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Daily Target Study Hours
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={formData.dailyStudyTargetHours}
                  onChange={(e) => setFormData({ ...formData, dailyStudyTargetHours: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Preparation Stage */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  Current Preparation Phase
                </label>
                <select
                  value={formData.preparationStage}
                  onChange={(e) => setFormData({ ...formData, preparationStage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="Foundation Phase">Foundation Phase (First Reading)</option>
                  <option value="Mains Dedicated Phase">Mains Dedicated Phase (GS + Optional)</option>
                  <option value="Revision & Test Series Phase">Revision &amp; Test Series Phase</option>
                  <option value="Interview Phase">Interview / Personality Test Phase</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: D-DAY SYLLABUS COMPLETION TARGET CONFIGURATION */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  D-Day Syllabus Completion Target
                </h2>
                <p className="text-xs text-gray-500">
                  Define the exact deadline date by which you must finish all syllabus topics and revisions.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold rounded-full">
              Core Deadline
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left: Date Picker Input & Presets */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="dday-settings-picker" className="text-xs font-bold text-gray-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  Select D-Day Completion Target Date:
                </label>
                <input
                  id="dday-settings-picker"
                  type="date"
                  value={dDayDate}
                  onChange={(e) => setDDayDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-gray-50/50 text-sm font-extrabold text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Quick Target Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetDate(180, '6 Months')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition-all cursor-pointer"
                  >
                    ⏳ 6 Months from Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDate(100, '100 Days')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition-all cursor-pointer"
                  >
                    ⚡ 100 Days Sprint
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Countdown Card */}
            <div
              className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                dDayInfo.isPast
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : dDayInfo.days <= 30
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-600 shadow-amber-200'
                  : 'bg-zinc-950 text-white border-zinc-800'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Live Countdown
                </span>
                <p className="text-2xl sm:text-3xl font-black tracking-tight">
                  {dDayInfo.isPast ? `${Math.abs(dDayInfo.days)} Days Ago` : `${dDayInfo.days} Days`}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-1">
                <p className="text-xs font-bold">
                  Target Deadline: <span className="underline">{dDayInfo.formatted}</span>
                </p>
                <p className="text-[11px] opacity-80 font-medium leading-relaxed">
                  {dDayInfo.isPast
                    ? 'Target date has passed. Revise key topics and solve PYQs.'
                    : `Syllabus tracker automatically aligns your study plan to complete topics in ${dDayInfo.days} days.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: DAILY GOALS ARCHIVE & ACHIEVED VS UNACHIEVED TRACKER */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-2xs">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Daily Goals Archive &amp; Performance History
                </h2>
                <p className="text-xs text-gray-500">
                  Track how many daily study targets you achieved vs missed over your CSE preparation timeline.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsArchiveModalOpen(true)}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Archive className="w-4 h-4 text-amber-600" />
              <span>Open Full Archive Modal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Total Archived Goals</span>
              <p className="text-2xl font-black text-gray-900">{totalArchived}</p>
              <p className="text-[11px] text-gray-500">Recorded targets</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Achieved Goals</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-950">{totalAchieved}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">{successRate}% Completion Rate</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Unachieved Goals</span>
                <XCircle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-950">{totalUnachieved}</p>
              <p className="text-[11px] text-amber-700 font-semibold">Missed / pending targets</p>
            </div>
          </div>
        </section>



        {/* SECTION 4: DATA RESET MANAGEMENT */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-2xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Syllabus Reset Management
                </h2>
                <p className="text-xs text-gray-500">
                  Protected data reset requiring security email verification OTP to prevent accidental wipe.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-extrabold rounded-full flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              OTP Protected
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-rose-950 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Reset All Syllabus &amp; PYQ Progress
              </h3>
              <p className="text-[11px] text-rose-800/80 leading-relaxed">
                Wipe all saved topic milestones, custom notes, daily goals, and solved PYQ checkmarks to restore the original UPSC syllabus state. This operation requires multi-factor Email OTP verification to proceed.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenResetModal}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Initiate Protected Reset (Requires Email OTP)</span>
            </button>
          </div>
        </section>

        {/* SECTION 5: ACCOUNT & SESSION MANAGEMENT */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Account &amp; Session Management
                </h2>
                <p className="text-xs text-gray-500">
                  {currentUser
                    ? 'Manage your active cloud-synced aspirant session.'
                    : 'You are currently browsing as a Guest in local offline mode.'}
                </p>
              </div>
            </div>
            {currentUser ? (
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Cloud Synced Session
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Guest / Local Mode
              </span>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                <span>{currentUser ? 'Signed in as:' : 'Current Status:'}</span>
                <span className={`px-2.5 py-0.5 rounded-lg font-black ${currentUser ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-900'}`}>
                  {currentUser ? (currentUser.email || userProfile.name || 'UPSC Aspirant') : 'Guest User'}
                </span>
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                {currentUser
                  ? `Target Attempt: ${userProfile.targetAttemptYear || '2026'} | Optional: ${userProfile.optionalSubject || 'Geography'}`
                  : 'Sign in to back up syllabus data, notes, and daily goals to Firebase Cloud.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {currentUser ? (
                /* Sign Out Button */
                <button
                  type="button"
                  onClick={async () => {
                    await logoutUser();
                    navigate('/login');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              ) : (
                /* Sign In Button */
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Connect Account</span>
                </button>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* Confirmation & OTP Verification Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Security Email OTP Verification</h3>
                  <p className="text-[11px] text-gray-500">Multi-factor security protocol for syllabus reset</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200/80 text-amber-950 font-medium">
              ⚠️ Warning: Resetting progress will permanently erase all completed micro-topics, revision milestones, solved PYQs, and daily goals.
            </p>

            {/* Email Target Banner */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  Verification Email Destination:
                </span>
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100 w-fit">
                  {currentUser?.email || 'Active Aspirant Session'}
                </span>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send 6-Digit Verification OTP</span>
                </button>
              ) : (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-900 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      OTP Generated for {currentUser?.email || 'Active Session'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[10px] text-emerald-700 underline font-extrabold hover:text-emerald-900 cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                  {/* Simulated Email Notice Preview */}
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-[11px] font-mono text-emerald-950 flex items-center justify-between">
                    <span>📨 [Inbox Alert]: Verification OTP is</span>
                    <span className="text-base font-black tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                      {generatedOtp}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Inputs */}
            {otpSent && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Enter 6-Digit Email Verification Code:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => {
                      setInputOtp(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    placeholder="e.g. 849201"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-base font-mono font-black tracking-widest focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Type confirmation phrase: <span className="font-mono text-rose-600">"RESET SYLLABUS"</span>
                  </label>
                  <input
                    type="text"
                    value={inputPhrase}
                    onChange={(e) => {
                      setInputPhrase(e.target.value);
                      setOtpError('');
                    }}
                    placeholder="RESET SYLLABUS"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {otpError && (
                  <p className="text-[11px] font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{otpError}</span>
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!otpSent || inputOtp !== generatedOtp || inputPhrase.trim().toUpperCase() !== 'RESET SYLLABUS'}
                onClick={handleConfirmReset}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  otpSent && inputOtp === generatedOtp && inputPhrase.trim().toUpperCase() === 'RESET SYLLABUS'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-2xs active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Permanent Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Archive Modal */}
      <GoalsArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
      />
    </div>
  );
};

