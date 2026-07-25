import React, { createContext, useContext, useState, useEffect } from 'react';
import { SyllabusData, TopicProgress, UserProfile, DailyGoal } from '../types';
import { INITIAL_SYLLABUS_DATA } from '../data/syllabusData';
import { auth, db, googleProvider } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  targetAttemptYear: '2026',
  optionalSubject: 'Geography',
  dailyStudyTargetHours: 8,
  preparationStage: 'Mains Dedicated Phase',
  hasCompletedOnboarding: false,
};

const getDateOffsetString = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const getDateOffsetISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const INITIAL_DAILY_GOALS: DailyGoal[] = [
  {
    id: 'goal-1',
    title: 'Revise Modern Indian History - Freedom Struggle Timeline',
    paper: 'GS I',
    date: getDateOffsetString(0),
    completed: true,
    completedAt: getDateOffsetISO(0),
    archived: false,
  },
  {
    id: 'goal-2',
    title: 'Solve 5 PYQs on Indian Polity - Basic Structure & Preamble',
    paper: 'GS II',
    date: getDateOffsetString(0),
    completed: true,
    completedAt: getDateOffsetISO(0),
    archived: false,
  },
  {
    id: 'goal-3',
    title: 'Draft 2 GS III Answer Frameworks on Inflation & Monetary Policy',
    paper: 'GS III',
    date: getDateOffsetString(0),
    completed: false,
    archived: false,
  },
  {
    id: 'goal-archived-1',
    title: 'Complete Ethics Case Studies on Conflict of Interest',
    paper: 'GS IV',
    date: getDateOffsetString(1),
    completed: true,
    completedAt: getDateOffsetISO(1),
    archived: true,
    archivedAt: getDateOffsetISO(1),
  },
  {
    id: 'goal-archived-2',
    title: 'Read Geography Optional Paper 1 Geomorphology Notes',
    paper: 'Optional',
    date: getDateOffsetString(2),
    completed: true,
    completedAt: getDateOffsetISO(2),
    archived: true,
    archivedAt: getDateOffsetISO(2),
  },
];

export interface SyllabusContextType {
  syllabusData: SyllabusData;
  dDayDate: string;
  setDDayDate: (date: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => void;
  dailyGoals: DailyGoal[];
  addDailyGoal: (title: string, paper: string, date?: string) => void;
  toggleDailyGoal: (id: string) => void;
  deleteDailyGoal: (id: string) => void;
  archiveDailyGoal: (id: string) => void;
  archiveAllCompletedGoals: () => void;
  archiveAllGoals: () => void;
  restoreDailyGoal: (id: string) => void;
  clearArchivedGoals: () => void;
  streakDays: number;
  toggleProgress: (paperId: string, subjectId: string, topicId: string, microthemeId: string, field: keyof TopicProgress) => void;
  togglePyqCompletion: (paperId: string, subjectId: string, topicId: string, microthemeId: string, pyqId: string) => void;
  updateMicrothemeDetails: (
    paperId: string,
    subjectId: string,
    topicId: string,
    microthemeId: string,
    details: { referenceSources?: string; notes?: string }
  ) => void;
  updateTopicDetails: (
    paperId: string,
    subjectId: string,
    topicId: string,
    microthemeId: string,
    details: { referenceSources?: string; notes?: string }
  ) => void;
  resetProgress: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Firebase Auth & Sync extensions
  currentUser: User | null;
  authLoading: boolean;
  isCloudSynced: boolean;
  signInWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const SyllabusContext = createContext<SyllabusContextType | undefined>(undefined);

export const SyllabusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // In-memory state synchronized live with Firestore Cloud
  const [syllabusData, setSyllabusData] = useState<SyllabusData>(INITIAL_SYLLABUS_DATA);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [dDayDate, setDDayState] = useState<string>('2026-09-18');
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(INITIAL_DAILY_GOALS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync Auth State & Auto Anonymous Auth for instant live cloud connection
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (user) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      setAuthLoading(false);

      if (user) {
        setCurrentUser(user);
        setIsCloudSynced(true);

        // Attach live Firestore listener to user's profile document in the cloud
        const userDocRef = doc(db, 'users', user.uid);
        profileUnsub = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const completedOnboarding = data.hasCompletedOnboarding !== undefined
              ? !!data.hasCompletedOnboarding
              : true; // Default to true for existing user documents so logged-in users aren't re-prompted

            setUserProfile({
              name: data.name || user.displayName || DEFAULT_USER_PROFILE.name,
              email: data.email || user.email || DEFAULT_USER_PROFILE.email,
              targetAttemptYear: data.targetAttemptYear || DEFAULT_USER_PROFILE.targetAttemptYear,
              optionalSubject: data.optionalSubject || DEFAULT_USER_PROFILE.optionalSubject,
              dailyStudyTargetHours: data.dailyStudyTargetHours ?? DEFAULT_USER_PROFILE.dailyStudyTargetHours,
              preparationStage: data.preparationStage || DEFAULT_USER_PROFILE.preparationStage,
              hasCompletedOnboarding: completedOnboarding,
            });
            if (data.dDayDate) {
              setDDayState(data.dDayDate);
            }
          } else {
            // First time cloud initialization for new user profile
            const newCloudProfile = {
              name: user.displayName || 'Aspirant',
              email: user.email || '',
              targetAttemptYear: DEFAULT_USER_PROFILE.targetAttemptYear,
              optionalSubject: DEFAULT_USER_PROFILE.optionalSubject,
              dailyStudyTargetHours: DEFAULT_USER_PROFILE.dailyStudyTargetHours,
              preparationStage: DEFAULT_USER_PROFILE.preparationStage,
              hasCompletedOnboarding: true, // Default to true for authenticated users
              dDayDate: '2026-09-18',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newCloudProfile).catch(console.error);
          }
        }, (error) => {
          console.error('Firestore user profile listener error:', error);
        });
      } else {
        setCurrentUser(null);
        setIsCloudSynced(false);
        setUserProfile(DEFAULT_USER_PROFILE);
        setDDayState('2026-09-18');
        setDailyGoals(INITIAL_DAILY_GOALS);
        setSyllabusData(INITIAL_SYLLABUS_DATA);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Sync Daily Goals with Firestore strictly for logged-in users
  useEffect(() => {
    if (!currentUser) return;

    const goalsRef = collection(db, 'users', currentUser.uid, 'goals');
    const unsubscribe = onSnapshot(goalsRef, (snapshot) => {
      if (!snapshot.empty) {
        const cloudGoals: DailyGoal[] = [];
        snapshot.forEach((docSnap) => {
          cloudGoals.push({ id: docSnap.id, ...docSnap.data() } as DailyGoal);
        });
        setDailyGoals(cloudGoals);
      } else {
        // Strictly set goals to empty for a clean cloud user with no saved goals
        setDailyGoals([]);
      }
    }, (error) => {
      console.error('Firestore goals snapshot error:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Auto-archive goals from previous days (whether completed or uncompleted) so daily goals reset each day
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowISO = new Date().toISOString();

    let needsUpdate = false;
    const processedGoals = dailyGoals.map((goal) => {
      const goalDateStr = (goal.date || '').slice(0, 10);
      if (!goal.archived && goalDateStr && goalDateStr < todayStr) {
        needsUpdate = true;
        const archivedGoal = {
          ...goal,
          archived: true,
          archivedAt: goal.archivedAt || nowISO,
        };
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'goals', goal.id), archivedGoal, { merge: true }).catch(console.error);
        }
        return archivedGoal;
      }
      return goal;
    });

    if (needsUpdate) {
      setDailyGoals(processedGoals);
    }
  }, [dailyGoals, currentUser]);

  // Sync Syllabus Progress with Firestore strictly for logged-in users
  useEffect(() => {
    if (!currentUser) return;

    const progressRef = collection(db, 'users', currentUser.uid, 'syllabusProgress');
    const unsubscribe = onSnapshot(progressRef, (snapshot) => {
      const progressMap: Record<string, any> = {};
      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          progressMap[docSnap.id] = docSnap.data();
        });
      }

      setSyllabusData(
        INITIAL_SYLLABUS_DATA.map((paper) => ({
          ...paper,
          subjects: paper.subjects.map((sub) => ({
            ...sub,
            topics: sub.topics.map((topic) => ({
              ...topic,
              microthemes: topic.microthemes.map((mt) => {
                const cloudData = progressMap[mt.id];
                if (!cloudData) {
                  return {
                    ...mt,
                    notes: '',
                    referenceSources: '',
                    progress: {
                      notesCompleted: false,
                      revision1: false,
                      revision2: false,
                      pyqsDone: false,
                      answerWriting: false,
                    },
                    pyqs: (mt.pyqs || []).map((q) => ({ ...q, completed: false })),
                  };
                }

                const pyqStatusObj = cloudData.pyqStatuses || {};
                const updatedPyqs = (mt.pyqs || []).map((pyq) => ({
                  ...pyq,
                  completed: pyqStatusObj[pyq.id] !== undefined ? pyqStatusObj[pyq.id] : false,
                }));

                return {
                  ...mt,
                  notes: cloudData.userNotes || '',
                  referenceSources: cloudData.referenceSources || '',
                  progress: {
                    notesCompleted: !!cloudData.milestones?.notesCompleted,
                    revision1: !!cloudData.milestones?.revision1,
                    revision2: !!cloudData.milestones?.revision2,
                    pyqsDone: !!cloudData.milestones?.pyqsDone,
                    answerWriting: !!cloudData.milestones?.answerWriting,
                    notesCompletedAt: cloudData.milestones?.notesCompletedAt || undefined,
                    revision1At: cloudData.milestones?.revision1At || undefined,
                    revision2At: cloudData.milestones?.revision2At || undefined,
                    pyqsDoneAt: cloudData.milestones?.pyqsDoneAt || undefined,
                    answerWritingAt: cloudData.milestones?.answerWritingAt || undefined,
                  },
                  pyqs: updatedPyqs,
                };
              }),
            })),
          })),
        }))
      );
    }, (error) => {
      console.error('Firestore progress snapshot error:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Auth Methods
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logoutUser = async () => {
    await signOut(auth);
    setIsCloudSynced(false);
    setUserProfile(DEFAULT_USER_PROFILE);
    setDDayState('2026-09-18');
    setDailyGoals(INITIAL_DAILY_GOALS);
    setSyllabusData(INITIAL_SYLLABUS_DATA);
  };

  const updateUserProfile = (profileUpdates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...profileUpdates };
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true }).catch(console.error);
      }
      return updated;
    });
  };

  const setDDayDate = (date: string) => {
    setDDayState(date);
    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid), { dDayDate: date }, { merge: true }).catch(console.error);
    }
  };

  const addDailyGoal = (title: string, paper: string, dateStr?: string) => {
    const newGoal: DailyGoal = {
      id: 'goal-' + Date.now(),
      title: title.trim(),
      paper: paper || 'GS I',
      date: dateStr || new Date().toISOString().slice(0, 10),
      completed: false,
      archived: false,
    };

    setDailyGoals((prev) => [newGoal, ...prev]);

    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'goals', newGoal.id), newGoal).catch(console.error);
    }
  };

  const toggleDailyGoal = (id: string) => {
    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== id) return goal;
        const nextCompleted = !goal.completed;
        const updatedGoal = {
          ...goal,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };

        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'goals', id), updatedGoal, { merge: true }).catch(console.error);
        }

        return updatedGoal;
      })
    );
  };

  const deleteDailyGoal = (id: string) => {
    setDailyGoals((prev) => prev.filter((goal) => goal.id !== id));
    if (currentUser) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'goals', id)).catch(console.error);
    }
  };

  const archiveDailyGoal = (id: string) => {
    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== id) return goal;
        const updatedGoal = {
          ...goal,
          archived: true,
          archivedAt: new Date().toISOString(),
        };

        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'goals', id), updatedGoal, { merge: true }).catch(console.error);
        }

        return updatedGoal;
      })
    );
  };

  const archiveAllCompletedGoals = () => {
    const now = new Date().toISOString();
    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (!goal.archived && goal.completed) {
          const updated = { ...goal, archived: true, archivedAt: now };
          if (currentUser) {
            setDoc(doc(db, 'users', currentUser.uid, 'goals', goal.id), updated, { merge: true }).catch(console.error);
          }
          return updated;
        }
        return goal;
      })
    );
  };

  const archiveAllGoals = () => {
    const now = new Date().toISOString();
    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (!goal.archived) {
          const updated = { ...goal, archived: true, archivedAt: now };
          if (currentUser) {
            setDoc(doc(db, 'users', currentUser.uid, 'goals', goal.id), updated, { merge: true }).catch(console.error);
          }
          return updated;
        }
        return goal;
      })
    );
  };

  const restoreDailyGoal = (id: string) => {
    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== id) return goal;
        const updated = {
          ...goal,
          archived: false,
          archivedAt: undefined,
        };
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'goals', id), updated, { merge: true }).catch(console.error);
        }
        return updated;
      })
    );
  };

  const clearArchivedGoals = () => {
    const archivedIds = dailyGoals.filter((g) => g.archived).map((g) => g.id);
    setDailyGoals((prev) => prev.filter((goal) => !goal.archived));

    if (currentUser) {
      archivedIds.forEach((id) => {
        deleteDoc(doc(db, 'users', currentUser.uid, 'goals', id)).catch(console.error);
      });
    }
  };

  // Streak Calculation
  const calculateStreakDays = (): number => {
    const completedDatesSet = new Set<string>();

    dailyGoals.forEach((goal) => {
      if (goal.completed) {
        if (goal.completedAt) {
          completedDatesSet.add(goal.completedAt.slice(0, 10));
        } else if (goal.date) {
          completedDatesSet.add(goal.date);
        }
      }
    });

    if (completedDatesSet.size === 0) return 0;

    const getFormattedDate = (dateObj: Date) => dateObj.toISOString().slice(0, 10);

    const todayStr = getFormattedDate(new Date());
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = getFormattedDate(yesterdayObj);

    let currentDateObj = new Date();

    if (completedDatesSet.has(todayStr)) {
      currentDateObj = new Date();
    } else if (completedDatesSet.has(yesterdayStr)) {
      currentDateObj = yesterdayObj;
    } else {
      return 0;
    }

    let streak = 0;
    while (true) {
      const dateStr = getFormattedDate(currentDateObj);
      if (completedDatesSet.has(dateStr)) {
        streak++;
        currentDateObj.setDate(currentDateObj.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streakDays = calculateStreakDays();

  // Helper function to persist microtheme updates to Firestore
  const persistMicrothemeToFirestore = (mt: any) => {
    if (!currentUser) return;

    const pyqStatusesObj: Record<string, boolean> = {};
    (mt.pyqs || []).forEach((q: any) => {
      pyqStatusesObj[q.id] = !!q.completed;
    });

    setDoc(doc(db, 'users', currentUser.uid, 'syllabusProgress', mt.id), {
      microthemeId: mt.id,
      milestones: mt.progress,
      userNotes: mt.notes || '',
      referenceSources: mt.referenceSources || '',
      pyqStatuses: pyqStatusesObj,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(console.error);
  };

  const toggleProgress = (
    paperId: string,
    subjectId: string,
    topicId: string,
    microthemeId: string,
    field: keyof TopicProgress
  ) => {
    setSyllabusData((prevData) =>
      prevData.map((paper) => {
        if (paper.id !== paperId) return paper;
        return {
          ...paper,
          subjects: paper.subjects.map((sub) => {
            if (sub.id !== subjectId) return sub;
            return {
              ...sub,
              topics: sub.topics.map((topic) => {
                if (topic.id !== topicId) return topic;
                return {
                  ...topic,
                  microthemes: topic.microthemes.map((mt) => {
                    if (mt.id !== microthemeId) return mt;
                    const nextVal = !mt.progress[field];
                    const timestampKey = `${field}At` as keyof TopicProgress;
                    const nextTimestamp = nextVal ? new Date().toISOString() : undefined;

                    let updatedPyqs = mt.pyqs;
                    if (field === 'pyqsDone' && mt.pyqs && mt.pyqs.length > 0) {
                      updatedPyqs = mt.pyqs.map((q) => ({ ...q, completed: nextVal }));
                    }

                    const updatedMt = {
                      ...mt,
                      pyqs: updatedPyqs,
                      progress: {
                        ...mt.progress,
                        [field]: nextVal,
                        [timestampKey]: nextTimestamp,
                      },
                    };

                    persistMicrothemeToFirestore(updatedMt);
                    return updatedMt;
                  }),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const togglePyqCompletion = (
    paperId: string,
    subjectId: string,
    topicId: string,
    microthemeId: string,
    pyqId: string
  ) => {
    setSyllabusData((prevData) =>
      prevData.map((paper) => {
        if (paper.id !== paperId) return paper;
        return {
          ...paper,
          subjects: paper.subjects.map((sub) => {
            if (sub.id !== subjectId) return sub;
            return {
              ...sub,
              topics: sub.topics.map((topic) => {
                if (topic.id !== topicId) return topic;
                return {
                  ...topic,
                  microthemes: topic.microthemes.map((mt) => {
                    if (mt.id !== microthemeId) return mt;
                    const updatedPyqs = (mt.pyqs || []).map((q) =>
                      q.id === pyqId ? { ...q, completed: !q.completed } : q
                    );
                    const hasCompletedPyq = updatedPyqs.some((q) => q.completed);
                    const pyqsDoneAt = hasCompletedPyq
                      ? (mt.progress.pyqsDoneAt || new Date().toISOString())
                      : undefined;

                    const updatedMt = {
                      ...mt,
                      pyqs: updatedPyqs,
                      progress: {
                        ...mt.progress,
                        pyqsDone: hasCompletedPyq,
                        pyqsDoneAt,
                      },
                    };

                    persistMicrothemeToFirestore(updatedMt);
                    return updatedMt;
                  }),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const updateMicrothemeDetails = (
    paperId: string,
    subjectId: string,
    topicId: string,
    microthemeId: string,
    details: { referenceSources?: string; notes?: string }
  ) => {
    setSyllabusData((prevData) =>
      prevData.map((paper) => {
        if (paper.id !== paperId) return paper;
        return {
          ...paper,
          subjects: paper.subjects.map((sub) => {
            if (sub.id !== subjectId) return sub;
            return {
              ...sub,
              topics: sub.topics.map((topic) => {
                if (topic.id !== topicId) return topic;
                return {
                  ...topic,
                  microthemes: topic.microthemes.map((mt) => {
                    if (mt.id !== microthemeId) return mt;
                    const updatedMt = {
                      ...mt,
                      referenceSources:
                        details.referenceSources !== undefined ? details.referenceSources : mt.referenceSources,
                      notes: details.notes !== undefined ? details.notes : mt.notes,
                    };

                    persistMicrothemeToFirestore(updatedMt);
                    return updatedMt;
                  }),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const updateTopicDetails = updateMicrothemeDetails;

  const resetProgress = () => {
    const pristineSyllabus: SyllabusData = INITIAL_SYLLABUS_DATA.map((paper) => ({
      ...paper,
      subjects: paper.subjects.map((sub) => ({
        ...sub,
        topics: sub.topics.map((topic) => ({
          ...topic,
          microthemes: topic.microthemes.map((mt) => ({
            ...mt,
            notes: '',
            referenceSources: '',
            progress: {
              notesCompleted: false,
              revision1: false,
              revision2: false,
              pyqsDone: false,
              answerWriting: false,
            },
            pyqs: (mt.pyqs || []).map((q) => ({
              ...q,
              completed: false,
            })),
          })),
        })),
      })),
    }));

    setSyllabusData(pristineSyllabus);
    setDailyGoals([]);
    setDDayState('2026-09-18');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <SyllabusContext.Provider
      value={{
        syllabusData,
        dDayDate,
        setDDayDate,
        userProfile,
        updateUserProfile,
        dailyGoals,
        addDailyGoal,
        toggleDailyGoal,
        deleteDailyGoal,
        archiveDailyGoal,
        archiveAllCompletedGoals,
        archiveAllGoals,
        restoreDailyGoal,
        clearArchivedGoals,
        streakDays,
        toggleProgress,
        togglePyqCompletion,
        updateMicrothemeDetails,
        updateTopicDetails,
        resetProgress,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,

        // Auth & Cloud
        currentUser,
        authLoading,
        isCloudSynced,
        signInWithGoogle,
        logoutUser,
      }}
    >
      {children}
    </SyllabusContext.Provider>
  );
};

export const useSyllabus = (): SyllabusContextType => {
  const context = useContext(SyllabusContext);
  if (!context) {
    throw new Error('useSyllabus must be used within a SyllabusProvider');
  }
  return context;
};

export const useUI = useSyllabus;
