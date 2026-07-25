import { SyllabusPaper } from '../../types';

export const essayData: SyllabusPaper = {
  id: 'essay',
  title: 'Essay Paper',
  subjects: [
    {
      id: 'essay-writing',
      title: 'Essay Writing Preparation',
      topics: [
        {
          id: 'essay-topic-1',
          title: 'Philosophical & Abstract Essays',
          microthemes: [
            {
              id: 'ess-mt-1',
              title: 'Brainstorming & Frameworks for Philosophical / Quote-based Topics',
              progress: { notesCompleted: false, revision1: false, revision2: false, pyqsDone: false, answerWriting: false }
            }
          ]
        },
        {
          id: 'essay-topic-2',
          title: 'Socio-Economic & Governance Essays',
          microthemes: [
            {
              id: 'ess-mt-2',
              title: 'Introduction, Body Paragraphing, Quotes Bank & Conclusion Techniques',
              progress: { notesCompleted: false, revision1: false, revision2: false, pyqsDone: false, answerWriting: false }
            }
          ]
        }
      ]
    }
  ]
};
