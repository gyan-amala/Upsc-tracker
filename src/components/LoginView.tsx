import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, AlertCircle, ArrowRight, Cloud, Sparkles } from 'lucide-react';
import { useSyllabus } from '../context/SyllabusContext';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, currentUser, logoutUser, authLoading } = useSyllabus();

  const [errors, setErrors] = useState<{ general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-redirect logged-in users directly to dashboard
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-700">Verifying session...</span>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      await signInWithGoogle();
      setIsSubmitting(false);
      navigate('/dashboard');
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('Google Sign-In error:', err);
      setErrors({ general: err.message || 'Google Sign-In failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              UPSC Aspirant Account
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1.5">
              Sign in with Google to enable instant live cloud synchronization across all your devices
            </p>
          </div>
        </div>

        {/* Logged in state banner */}
        {currentUser && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Signed in as {currentUser.displayName || currentUser.email}</p>
                <p className="text-[10px] font-medium text-emerald-700">Cloud Sync is Active</p>
              </div>
            </div>
            <button
              onClick={() => logoutUser()}
              className="text-[11px] font-bold text-red-600 hover:underline px-2 py-1 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {errors.general && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Google Auth Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-2xs disabled:opacity-50 hover:border-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSubmitting ? 'Authenticating...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Why sign in with Google?</span>
          </div>
          <ul className="text-[11px] font-medium text-gray-500 space-y-1 pl-5 list-disc">
            <li>Sync your GS progress, PYQ bookmarks & notes live across all devices.</li>
            <li>Automatic cloud backups to secure your preparation data.</li>
            <li>Instant 1-click authentication with zero extra passwords to remember.</li>
          </ul>
        </div>

        <div className="pt-2 text-center border-t border-gray-100 space-y-3">
          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 hover:text-indigo-600 transition-all shadow-2xs cursor-pointer"
          >
            <span>Continue as Guest (Explore Dashboard)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <p className="text-[11px] font-medium text-gray-400 text-center">
            Guest progress is saved locally in your browser cache.
          </p>
        </div>
      </div>
    </div>
  );
};
