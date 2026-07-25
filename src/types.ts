export type NavTabId = 'dashboard' | 'syllabus';

export interface NavItem {
  id: NavTabId;
  label: string;
  iconName: string;
}

export interface TopicProgress {
  notesCompleted: boolean;
  revision1: boolean;
  revision2: boolean;
  pyqsDone: boolean;
  answerWriting: boolean;
  notesCompletedAt?: string;
  revision1At?: string;
  revision2At?: string;
  pyqsDoneAt?: string;
  answerWritingAt?: string;
}

export interface PYQQuestion {
  id: string;
  year: number;
  question: string;
  marks?: number;
  wordLimit?: number;
  completed?: boolean;
}

// Level 4: Microtheme
export interface SyllabusMicrotheme {
  id: string;
  title: string;
  progress: TopicProgress;
  pyqs?: PYQQuestion[];
  referenceSources?: string;
  notes?: string;
}

// Level 3: Topic
export interface SyllabusTopic {
  id: string;
  title: string;
  microthemes: SyllabusMicrotheme[];
}

// Level 2: Subject
export interface SyllabusSubject {
  id: string;
  title: string;
  topics: SyllabusTopic[];
}

// Level 1: GS Paper
export interface SyllabusPaper {
  id: string;
  title: string;
  subjects: SyllabusSubject[];
}

export type SyllabusData = SyllabusPaper[];

export interface UserProfile {
  name: string;
  email: string;
  targetAttemptYear: string;
  optionalSubject: string;
  dailyStudyTargetHours: number;
  preparationStage: string;
  hasCompletedOnboarding?: boolean;
}

export interface DailyGoal {
  id: string;
  title: string;
  paper: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  archived: boolean;
  archivedAt?: string;
}
