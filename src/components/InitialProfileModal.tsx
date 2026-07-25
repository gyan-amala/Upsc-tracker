import React, { useState } from 'react';
import { useSyllabus } from '../context/SyllabusContext';
import { 
  User, 
  Award, 
  BookOpen, 
  Clock, 
  SlidersHorizontal, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  Target,
  CheckCircle2
} from 'lucide-react';

export const InitialProfileModal: React.FC = () => {
  const { userProfile, updateUserProfile, dDayDate, setDDayDate, currentUser } = useSyllabus();

  const [formData, setFormData] = useState({
    name: userProfile.name || (currentUser?.displayName ?? ''),
    targetAttemptYear: userProfile.targetAttemptYear || '2026',
    optionalSubject: userProfile.optionalSubject || 'Geography',
    dailyStudyTargetHours: userProfile.dailyStudyTargetHours || 8,
    preparationStage: userProfile.preparationStage || 'Mains Dedicated Phase',
  });

  const [selectedDDay, setSelectedDDay] = useState(dDayDate || '2026-09-18');
  const [errorMsg, setErrorMsg] = useState('');

  // Hide modal if onboarding is completed or if user is already logged in with an active profile
  if (userProfile.hasCompletedOnboarding || (currentUser && userProfile.name)) {
    return null;
  }

  const handleSkip = () => {
    updateUserProfile({
      name: formData.name.trim() || currentUser?.displayName || 'Aspirant',
      hasCompletedOnboarding: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your candidate name.');
      return;
    }

    const parsedHours = parseInt(String(formData.dailyStudyTargetHours), 10);
    const finalHours = isNaN(parsedHours) || parsedHours <= 0 ? 8 : Math.min(24, parsedHours);

    // Update profile in Context and Firestore cloud
    updateUserProfile({
      name: formData.name.trim(),
      targetAttemptYear: formData.targetAttemptYear,
      optionalSubject: formData.optionalSubject,
      dailyStudyTargetHours: finalHours,
      preparationStage: formData.preparationStage,
      hasCompletedOnboarding: true,
    });

    setDDayDate(selectedDDay);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 p-6 sm:p-8 text-white space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Welcome Aspirant &bull; First Time Setup</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Configure Your CSE Mains Profile
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
            Please fill in your preparation details to personalize your Mains syllabus tracker, target attempt deadlines, and daily study goals.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Candidate Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Candidate Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrorMsg('');
                }}
                placeholder="e.g. Aditya Gurjar"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
              />
            </div>

            {/* Target CSE Attempt Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                Target CSE Attempt Year
              </label>
              <select
                value={formData.targetAttemptYear}
                onChange={(e) => setFormData({ ...formData, targetAttemptYear: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all cursor-pointer"
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
              <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Optional Subject
              </label>
              <select
                value={formData.optionalSubject}
                onChange={(e) => setFormData({ ...formData, optionalSubject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all cursor-pointer"
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

            {/* Daily Target Study Hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Daily Target Study Hours
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={formData.dailyStudyTargetHours}
                onChange={(e) => setFormData({ ...formData, dailyStudyTargetHours: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
              />
            </div>

            {/* Current Preparation Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                Current Preparation Stage
              </label>
              <select
                value={formData.preparationStage}
                onChange={(e) => setFormData({ ...formData, preparationStage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all cursor-pointer"
              >
                <option value="Foundation Phase">Foundation Phase (First Reading)</option>
                <option value="Mains Dedicated Phase">Mains Dedicated Phase (GS + Optional)</option>
                <option value="Revision & Test Series Phase">Revision &amp; Test Series Phase</option>
                <option value="Interview Phase">Interview / Personality Test Phase</option>
              </select>
            </div>
          </div>

          {/* D-Day Target Date Picker */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="modal-dday-picker" className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-600" />
                <span>Target D-Day Mains Deadline:</span>
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                Core Deadline
              </span>
            </div>

            <div>
              <input
                id="modal-dday-picker"
                type="date"
                value={selectedDDay}
                onChange={(e) => setSelectedDDay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-extrabold text-gray-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-1/3 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Skip to Dashboard
            </button>
            <button
              type="submit"
              className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Profile &amp; Start Preparation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
