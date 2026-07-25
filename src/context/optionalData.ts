import { SyllabusPaper } from '../../types';

export const optionalData: SyllabusPaper = {
  id: 'optional',
  title: 'Optional Subject Paper I & II',
  subjects: [
    {
      id: 'optional-p1',
      title: 'Optional Paper I',
      topics: [
        {
          id: 'opt1-topic-1',
          title: 'Core Theories & Foundations',
          microthemes: [
            {
              id: 'opt1-mt-1',
              title: 'Core Concepts, Key Thinkers, Models & Classical Theories',
              progress: { notesCompleted: false, revision1: false, revision2: false, pyqsDone: false, answerWriting: false }
            },
            {
              id: 'opt1-mt-2',
              title: 'Advanced Debates & Applied Theoretical Frameworks',
              progress: { notesCompleted: false, revision1: false, revision2: false, pyqsDone: false, answerWriting: false }
            }
          ]
        }
      ]
    },
    {
      id: 'optional-p2',
      title: 'Optional Paper II',
      topics: [
        {
          id: 'opt2-topic-1',
          title: 'Indian Context & Applied Case Studies',
          microthemes: [
            {
              id: 'opt2-mt-1',
              title: 'Indian Perspectives, Contemporary Issues & Case Study Mapping',
              progress: { notesCompleted: false, revision1: false, revision2: false, pyqsDone: false, answerWriting: false }
            },
            {
              id: 'opt2-mt-2',
              title: 'PYQ Trend Analysis & Dedicated Answer Writing Practice',
              progress: { notesCompleted: false, revision1: false, revision2: false, pyqsDone: false, answerWriting: false }
            }
          ]
        }
      ]
    }
  ]
};
