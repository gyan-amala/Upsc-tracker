import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronsDown,
  ChevronsUp,
  Check, 
  BookOpen, 
  Layers, 
  RotateCcw,
  FileText,
  HelpCircle,
  PenTool,
  X,
  ExternalLink,
  Save,
  CheckCircle2,
  Tag,
  FileQuestion,
  ListTree
} from 'lucide-react';
import { TopicProgress, SyllabusMicrotheme, SyllabusTopic, SyllabusSubject, SyllabusPaper } from '../types';
import { useSyllabus } from '../context/SyllabusContext';

interface PillConfig {
  key: keyof TopicProgress;
  label: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROGRESS_PILLS: PillConfig[] = [
  { 
    key: 'notesCompleted', 
    label: 'Notes', 
    tooltip: '1st Stage: Comprehensive self or coaching notes prepared', 
    icon: FileText 
  },
  { 
    key: 'revision1', 
    label: 'Rev 1', 
    tooltip: '2nd Stage: 1st revision round completed within 7 days', 
    icon: RotateCcw 
  },
  { 
    key: 'revision2', 
    label: 'Rev 2', 
    tooltip: '3rd Stage: 2nd revision round completed for active recall', 
    icon: RotateCcw 
  },
  { 
    key: 'pyqsDone', 
    label: 'PYQs', 
    tooltip: '4th Stage: Solved last 10 years UPSC Mains PYQs for this theme', 
    icon: HelpCircle 
  },
  { 
    key: 'answerWriting', 
    label: 'Answers', 
    tooltip: '5th Stage: Written practice answer logged for this theme', 
    icon: PenTool 
  },
];

const formatCompletedDate = (isoString?: string) => {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
};

export const SyllabusTrackerView: React.FC = () => {
  const { syllabusData, toggleProgress, togglePyqCompletion, updateMicrothemeDetails } = useSyllabus();

  // Accordion levels: Level 1 (Papers), Level 2 (Subjects), Level 3 (Topics)
  const [expandedPapers, setExpandedPapers] = useState<Record<string, boolean>>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Microtheme Workspace slide-out panel state
  const [activeMicrothemeRef, setActiveMicrothemeRef] = useState<{
    paperId: string;
    subjectId: string;
    topicId: string;
    microthemeId: string;
    paperTitle: string;
    subjectTitle: string;
    topicTitle: string;
  } | null>(null);

  // Local draft states for textareas inside Workspace
  const [draftSources, setDraftSources] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Derive active microtheme from global syllabus context
  const activeMicrotheme = activeMicrothemeRef
    ? syllabusData
        .find((p) => p.id === activeMicrothemeRef.paperId)
        ?.subjects.find((s) => s.id === activeMicrothemeRef.subjectId)
        ?.topics.find((t) => t.id === activeMicrothemeRef.topicId)
        ?.microthemes.find((m) => m.id === activeMicrothemeRef.microthemeId)
    : null;

  // Sync draft text whenever active microtheme changes
  useEffect(() => {
    if (activeMicrotheme) {
      setDraftSources(activeMicrotheme.referenceSources || '');
      setDraftNotes(activeMicrotheme.notes || '');
      setIsSavedNotice(false);
    }
  }, [activeMicrothemeRef?.microthemeId, activeMicrotheme?.referenceSources, activeMicrotheme?.notes]);

  const handleSaveDetails = () => {
    if (!activeMicrothemeRef) return;
    updateMicrothemeDetails(
      activeMicrothemeRef.paperId,
      activeMicrothemeRef.subjectId,
      activeMicrothemeRef.topicId,
      activeMicrothemeRef.microthemeId,
      {
        referenceSources: draftSources,
        notes: draftNotes,
      }
    );
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const togglePaperAccordion = (paperId: string) => {
    setExpandedPapers((prev) => ({ ...prev, [paperId]: !prev[paperId] }));
  };

  const toggleSubjectAccordion = (subjectId: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const toggleTopicAccordion = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const expandAll = () => {
    const allPapers: Record<string, boolean> = {};
    const allSubs: Record<string, boolean> = {};
    const allTops: Record<string, boolean> = {};

    syllabusData.forEach((paper) => {
      allPapers[paper.id] = true;
      paper.subjects.forEach((sub) => {
        allSubs[sub.id] = true;
        sub.topics.forEach((top) => {
          allTops[top.id] = true;
        });
      });
    });

    setExpandedPapers(allPapers);
    setExpandedSubjects(allSubs);
    setExpandedTopics(allTops);
  };

  const collapseAll = () => {
    setExpandedPapers({});
    setExpandedSubjects({});
    setExpandedTopics({});
  };

  // Utility to calculate completed progress stats for a list of microthemes
  const calculateMicrothemeProgressStats = (microthemes: SyllabusMicrotheme[]) => {
    if (!microthemes || microthemes.length === 0) return { completed: 0, total: 0, percentage: 0 };
    let totalFields = 0;
    let completedFields = 0;

    microthemes.forEach((m) => {
      totalFields += 5;
      if (m.progress.notesCompleted) completedFields++;
      if (m.progress.revision1) completedFields++;
      if (m.progress.revision2) completedFields++;
      if (m.progress.pyqsDone) completedFields++;
      if (m.progress.answerWriting) completedFields++;
    });

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    return { completed: completedFields, total: totalFields, percentage };
  };

  // Calculate paper-level stats across all 4 divisions
  const calculatePaperProgressStats = (paper: SyllabusPaper) => {
    const allMicrothemes = paper.subjects
      .flatMap((s) => s.topics)
      .flatMap((t) => t.microthemes);
    return calculateMicrothemeProgressStats(allMicrothemes);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Page Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <ListTree className="w-3.5 h-3.5 text-indigo-600" />
            <span>4-Tier Hierarchy: GS Paper &rarr; Subject &rarr; Topic &rarr; Microthemes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Syllabus &amp; Microthemes Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Organized in 4 distinct levels: GS Paper, Subject, Topic, and granular Microthemes with 10-Year UPSC Mains PYQs.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={expandAll}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <ChevronsDown className="w-4 h-4" />
            <span>Expand All</span>
          </button>
          <button
            onClick={collapseAll}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <ChevronsUp className="w-4 h-4" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* 4 Divisions Syllabus Tree */}
      <div className="space-y-4">
        {syllabusData.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Syllabus Data Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Your syllabus dataset is currently empty.
            </p>
          </div>
        ) : (
          syllabusData.map((paper) => {
            const isPaperExpanded = !!expandedPapers[paper.id];
            const paperStats = calculatePaperProgressStats(paper);
            const totalMicrothemes = paper.subjects
              .flatMap((s) => s.topics)
              .flatMap((t) => t.microthemes).length;

            return (
              <div
                key={paper.id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all"
              >
                {/* Division 1: GS Paper Header */}
                <div
                  onClick={() => togglePaperAccordion(paper.id)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between cursor-pointer bg-white hover:bg-gray-50/80 transition-colors select-none"
                >
                  <div className="flex items-center space-x-3.5 min-w-0 pr-4">
                    <span className="px-3 py-1.5 bg-zinc-900 text-white rounded-xl font-bold text-xs shrink-0 tracking-tight shadow-2xs">
                      {paper.id.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        <span>{paper.subjects.length} Subjects</span>
                        <span>&bull;</span>
                        <span>{totalMicrothemes} Microthemes</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">
                          {paperStats.percentage}%
                        </span>
                        <div className="w-20 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${paperStats.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {paperStats.completed}/{paperStats.total} Milestones
                      </span>
                    </div>

                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      {isPaperExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Division 2: Subjects Container */}
                {isPaperExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-6 space-y-4">
                    {paper.subjects.map((subject) => {
                      const isSubjectExpanded = !!expandedSubjects[subject.id];
                      const subMicrothemes = subject.topics.flatMap((t) => t.microthemes);
                      const subStats = calculateMicrothemeProgressStats(subMicrothemes);

                      return (
                        <div
                          key={subject.id}
                          className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden"
                        >
                          {/* Division 2 Header: Subject */}
                          <div
                            onClick={() => toggleSubjectAccordion(subject.id)}
                            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer bg-gray-50/90 hover:bg-gray-100/70 transition-colors select-none"
                          >
                            <div className="flex items-center space-x-3 min-w-0 pr-2">
                              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
                                <Layers className="w-4 h-4" />
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                    {subject.title}
                                  </h4>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {subject.topics.length} Topics &bull; {subMicrothemes.length} Microthemes
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 shrink-0">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-gray-700 border border-gray-200">
                                {subStats.percentage}% Complete
                              </span>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                {isSubjectExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Division 3: Topics List inside Subject */}
                          {isSubjectExpanded && (
                            <div className="p-4 sm:p-5 space-y-5 bg-white">
                              {subject.topics.map((topic) => {
                                const isTopicExpanded = !!expandedTopics[topic.id];
                                const topicStats = calculateMicrothemeProgressStats(topic.microthemes);

                                return (
                                  <div
                                    key={topic.id}
                                    className="rounded-2xl border border-indigo-100/80 bg-indigo-50/20 overflow-hidden"
                                  >
                                    {/* Division 3 Header: Topic */}
                                    <div
                                      onClick={() => toggleTopicAccordion(topic.id)}
                                      className="p-3.5 sm:p-4 bg-indigo-50/60 hover:bg-indigo-100/50 flex items-center justify-between cursor-pointer transition-colors border-b border-indigo-100/60 select-none"
                                    >
                                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                        <Tag className="w-4 h-4 text-indigo-600 shrink-0" />
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <h5 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                              {topic.title}
                                            </h5>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-2.5 shrink-0">
                                        <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                                          {topicStats.percentage}%
                                        </span>
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                          {isTopicExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-indigo-700" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Division 4: Microthemes List */}
                                    {isTopicExpanded && (
                                      <div className="p-3 sm:p-4 space-y-3 bg-white divide-y divide-gray-100">
                                        {topic.microthemes.map((microtheme) => {
                                          let mtDone = 0;
                                          if (microtheme.progress.notesCompleted) mtDone++;
                                          if (microtheme.progress.revision1) mtDone++;
                                          if (microtheme.progress.revision2) mtDone++;
                                          if (microtheme.progress.pyqsDone) mtDone++;
                                          if (microtheme.progress.answerWriting) mtDone++;

                                          const mtPct = (mtDone / 5) * 100;

                                          return (
                                            <div
                                              key={microtheme.id}
                                              className="pt-3 first:pt-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5"
                                            >
                                              {/* Microtheme Title & Workspace trigger */}
                                              <div className="space-y-1 max-w-xl">
                                                <div className="flex items-start gap-2">
                                                  <span className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                                                  <div>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setActiveMicrothemeRef({
                                                          paperId: paper.id,
                                                          subjectId: subject.id,
                                                          topicId: topic.id,
                                                          microthemeId: microtheme.id,
                                                          paperTitle: paper.title,
                                                          subjectTitle: subject.title,
                                                          topicTitle: topic.title,
                                                        })
                                                      }
                                                      className="text-left group/title focus:outline-hidden inline-baseline"
                                                    >
                                                      <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover/title:text-indigo-600 transition-colors leading-snug">
                                                        {microtheme.title}
                                                      </span>
                                                      <ExternalLink className="w-3 h-3 text-gray-300 group-hover/title:text-indigo-500 inline ml-1.5 shrink-0 transition-colors" />
                                                    </button>
                                                  </div>
                                                </div>

                                                {/* Microtheme Indicators (Notes & PYQs) */}
                                                <div className="flex flex-wrap items-center gap-2 pl-4">
                                                  <div className="flex items-center space-x-1.5">
                                                    <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                      <div
                                                        className={`h-full rounded-full transition-all ${
                                                          mtPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                                                        }`}
                                                        style={{ width: `${mtPct}%` }}
                                                      ></div>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-gray-500">
                                                      {mtDone}/5
                                                    </span>
                                                  </div>

                                                  {(microtheme.notes || microtheme.referenceSources) && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                                      <FileText className="w-3 h-3" />
                                                      Notes
                                                    </span>
                                                  )}

                                                  {microtheme.pyqs && microtheme.pyqs.length > 0 && (
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setActiveMicrothemeRef({
                                                          paperId: paper.id,
                                                          subjectId: subject.id,
                                                          topicId: topic.id,
                                                          microthemeId: microtheme.id,
                                                          paperTitle: paper.title,
                                                          subjectTitle: subject.title,
                                                          topicTitle: topic.title,
                                                        })
                                                      }
                                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-colors cursor-pointer shadow-2xs"
                                                      title="Click to view Previous Year Questions"
                                                    >
                                                      <HelpCircle className="w-3 h-3 text-amber-600" />
                                                      <span>{microtheme.pyqs.length} PYQs</span>
                                                      <div className="flex items-center gap-0.5 ml-1 border-l border-amber-200 pl-1">
                                                        {Array.from(new Set(microtheme.pyqs.map((q) => q.year)))
                                                          .sort((a, b) => b - a)
                                                          .map((year) => (
                                                            <span key={`year-badge-${microtheme.id}-${year}`} className="bg-amber-100/90 text-amber-900 px-1 rounded text-[9px] font-mono font-bold">
                                                              '{String(year).slice(-2)}
                                                            </span>
                                                          ))}
                                                      </div>
                                                    </button>
                                                  )}
                                                </div>
                                              </div>

                                              {/* 5 Milestone Checkbox Pills */}
                                              <div className="flex flex-wrap items-center gap-1.5 shrink-0 pl-4 lg:pl-0">
                                                {PROGRESS_PILLS.map((pill) => {
                                                  const isCompleted = !!microtheme.progress[pill.key];
                                                  const timestampKey = `${pill.key}At` as keyof TopicProgress;
                                                  const completedAtVal = microtheme.progress[timestampKey] as string | undefined;
                                                  const formattedCompletedAt = isCompleted ? formatCompletedDate(completedAtVal) : null;
                                                  const Icon = pill.icon;

                                                  return (
                                                    <div key={pill.key} className="relative group/pill">
                                                      <button
                                                        type="button"
                                                        title={`${pill.label}: ${pill.tooltip}`}
                                                        onClick={() =>
                                                          toggleProgress(
                                                            paper.id,
                                                            subject.id,
                                                            topic.id,
                                                            microtheme.id,
                                                            pill.key
                                                          )
                                                        }
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 select-none cursor-pointer ${
                                                          isCompleted
                                                            ? 'bg-emerald-600 border border-emerald-600 text-white shadow-2xs hover:bg-emerald-700 active:scale-95'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 shadow-2xs active:scale-95'
                                                        }`}
                                                      >
                                                        {isCompleted ? (
                                                          <Check className="w-3 h-3 stroke-[2.5] mr-1 text-white shrink-0" />
                                                        ) : (
                                                          <Icon className="w-3 h-3 mr-1 text-gray-400 shrink-0" />
                                                        )}
                                                        <span>{pill.label}</span>
                                                      </button>

                                                      {/* Subtle Floating Tooltip */}
                                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pill:flex flex-col items-center pointer-events-none z-30 transition-all duration-200">
                                                        <div className="bg-zinc-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap border border-zinc-700/80">
                                                          <div>
                                                            <span className="font-bold text-amber-300">{pill.label}:</span> {pill.tooltip}
                                                          </div>
                                                          {formattedCompletedAt && (
                                                            <div className="text-[10px] text-emerald-300 font-bold mt-0.5 flex items-center gap-1">
                                                              <Check className="w-3 h-3 text-emerald-400 inline" />
                                                              Done: {formattedCompletedAt}
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div className="w-2 h-2 bg-zinc-900 rotate-45 -mt-1 border-r border-b border-zinc-700/80"></div>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Slide-out Microtheme Workspace Panel */}
      {activeMicrothemeRef && activeMicrotheme && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setActiveMicrothemeRef(null)}
          ></div>

          {/* Right Drawer */}
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-gray-100">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                    Microtheme Workspace
                  </span>
                  <span className="text-xs text-gray-400 font-medium truncate">
                    {activeMicrothemeRef.paperId.toUpperCase()} &bull; {activeMicrothemeRef.subjectTitle}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {activeMicrotheme.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium truncate">
                  Topic: {activeMicrothemeRef.topicTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMicrothemeRef(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 focus:outline-hidden cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Milestone Toggles inside Workspace */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <p className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Milestone Toggles</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Live Sync</span>
                </p>
                <div className="flex flex-wrap items-start gap-2.5 pt-1">
                  {PROGRESS_PILLS.map((pill) => {
                    const isCompleted = !!activeMicrotheme.progress[pill.key];
                    const timestampKey = `${pill.key}At` as keyof TopicProgress;
                    const completedAtVal = activeMicrotheme.progress[timestampKey] as string | undefined;
                    const formattedCompletedAt = isCompleted ? formatCompletedDate(completedAtVal) : null;
                    const Icon = pill.icon;
                    return (
                      <div key={pill.key} className="flex flex-col items-start gap-1">
                        <button
                          type="button"
                          title={`${pill.label}: ${pill.tooltip}${formattedCompletedAt ? ` (Completed on ${formattedCompletedAt})` : ''}`}
                          onClick={() =>
                            toggleProgress(
                              activeMicrothemeRef.paperId,
                              activeMicrothemeRef.subjectId,
                              activeMicrothemeRef.topicId,
                              activeMicrotheme.id,
                              pill.key
                            )
                          }
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 select-none cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 border border-emerald-600 text-white shadow-2xs hover:bg-emerald-700 active:scale-95'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 shadow-2xs active:scale-95'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5] mr-1 text-white shrink-0" />
                          ) : (
                            <Icon className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                          )}
                          <span>{pill.label}</span>
                        </button>
                        {formattedCompletedAt && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                            {formattedCompletedAt}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Previous Year Questions Section in Workspace */}
              {activeMicrotheme.pyqs && activeMicrotheme.pyqs.length > 0 && (
                <div className="space-y-3 p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                        <FileQuestion className="w-4 h-4" />
                      </span>
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Previous Year Questions ({activeMicrotheme.pyqs.length})
                      </h4>
                    </div>
                    <span className="text-[10px] text-amber-800 font-medium">
                      Toggle checkbox to track completion
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {activeMicrotheme.pyqs.map((q) => (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          q.completed
                            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                            : 'bg-white border-amber-200/80 text-gray-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              togglePyqCompletion(
                                activeMicrothemeRef.paperId,
                                activeMicrothemeRef.subjectId,
                                activeMicrothemeRef.topicId,
                                activeMicrotheme.id,
                                q.id
                              )
                            }
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              q.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-gray-300 hover:border-indigo-500'
                            }`}
                          >
                            {q.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                                UPSC {q.year}
                              </span>
                              {q.marks && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                                  {q.marks} Marks
                                </span>
                              )}
                              {q.wordLimit && (
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                                  {q.wordLimit} Words
                                </span>
                              )}
                              {q.completed && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Solved &amp; Practiced
                                </span>
                              )}
                            </div>
                            <p className={`text-xs leading-relaxed font-medium ${q.completed ? 'line-through text-emerald-800' : 'text-gray-900'}`}>
                              {q.question}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Textarea 1: Reference Sources */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Reference Sources
                </label>
                <p className="text-xs text-gray-400">
                  Standard textbooks, NCERT chapters, committee reports, or coaching modules.
                </p>
                <textarea
                  value={draftSources}
                  onChange={(e) => setDraftSources(e.target.value)}
                  placeholder="e.g., Laxmikanth Ch 22 (Parliament), NCERT Class 11 Constitution at Work Ch 5..."
                  className="w-full h-28 p-3.5 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-gray-800 placeholder-gray-400 outline-hidden transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Textarea 2: Personal Notes / Keywords */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Personal Notes / Keywords
                </label>
                <p className="text-xs text-gray-400">
                  Key concepts, constitutional articles, Supreme Court precedents, and revision points.
                </p>
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="e.g., Article 105 (Parliamentary Privileges), 104th CAA, Speaker's discretion under 10th Schedule, NCRWC recommendations..."
                  className="w-full h-52 p-3.5 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-gray-800 placeholder-gray-400 outline-hidden transition-all resize-none leading-relaxed font-mono text-[13px]"
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                {isSavedNotice && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Saved!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMicrothemeRef(null)}
                  className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
