import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Link, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { DashboardView } from '../components/DashboardView';
import { SyllabusTrackerView } from '../components/SyllabusTrackerView';
import { ProfileSettingsView } from '../components/ProfileSettingsView';
import { LoginView } from '../components/LoginView';
import { InitialProfileModal } from '../components/InitialProfileModal';
import { ArrowLeft, BookOpen, CheckCircle2, FileText, LogIn } from 'lucide-react';

// Scroll to top helper component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};

// Topic Details View Component for /syllabus/:paper/:topicId
const TopicDetailsView: React.FC = () => {
  const { paper, topicId } = useParams<{ paper: string; topicId: string }>();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/syllabus"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-xl border border-gray-200 transition-all shadow-2xs hover:shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Syllabus Tracker</span>
        </Link>
        <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold rounded-full uppercase tracking-wider">
          {paper || 'General Studies'}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Topic ID: {topicId}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Detailed Topic Workspace
          </h1>
          <p className="text-xs text-gray-500">
            Paper Parameter: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">{paper}</code> | Topic ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">{topicId}</code>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Reference Sources</span>
            </div>
            <p className="text-xs text-gray-500">
              NCERTs, Standard Reference Books, Coaching Class Notes, and PIB articles linked to this topic.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Revision & PYQ Status</span>
            </div>
            <p className="text-xs text-gray-500">
              Track 2-stage revisions, 10-year Mains PYQ solutions, and structured answer writing logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Layout Component with Sidebar
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row antialiased text-gray-900">
      <InitialProfileModal />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h1 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>UPSC CSE Mains Tracker</span>
            </h1>
          </div>
        </header>
        <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginView />} />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardView />
            </AppLayout>
          }
        />
        <Route
          path="/syllabus"
          element={
            <AppLayout>
              <SyllabusTrackerView />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <ProfileSettingsView />
            </AppLayout>
          }
        />
        <Route
          path="/syllabus/:paper/:topicId"
          element={
            <AppLayout>
              <TopicDetailsView />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
