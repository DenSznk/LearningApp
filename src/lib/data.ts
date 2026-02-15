
export type Level = 1 | 2 | 3 | 4 | 5;
export type KnowledgeGrade = 0 | 1 | 2 | 3 | 4 | 5; // 0 = unattempted/unknown

export interface Question {
  id: string;
  text: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer?: string;
  week?: string;
}

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

export const TOPICS = [
  'Basics',
  'Hooks',
  'State Management',
  'Performance',
  'Next.js specific',
  'React Native specific',
] as const;

export type TopicName = typeof TOPICS[number];

// Mock Data
export const MOCK_QUESTIONS: Question[] = [
  // Basics
  {
    id: 'react-basic-1',
    text: 'What is the Virtual DOM and how does it work?',
    topic: 'Basics',
    difficulty: 'easy',
  },
  {
    id: 'react-basic-2',
    text: 'Explain the component lifecycle in React (Class vs Functional).',
    topic: 'Basics',
    difficulty: 'medium',
  },
  // Hooks
  {
    id: 'react-hook-1',
    text: 'What is the purpose of useEffect? When does it run?',
    topic: 'Hooks',
    difficulty: 'easy',
  },
  {
    id: 'react-hook-2',
    text: 'Explain useMemo vs useCallback.',
    topic: 'Hooks',
    difficulty: 'medium',
  },
  // State
  {
    id: 'react-state-1',
    text: 'What is the difference between specific state types (Local vs Global)?',
    topic: 'State Management',
    difficulty: 'easy',
  },
  // React Native
  {
    id: 'rn-basic-1',
    text: 'What is the difference between View and div?',
    topic: 'React Native specific',
    difficulty: 'easy',
  },
  {
    id: 'rn-bridge-1',
    text: 'Explain the React Native Bridge.',
    topic: 'React Native specific',
    difficulty: 'hard',
  },
];

export const EXAMS = [
  { id: 'react', title: 'React Exam', topics: ['Basics', 'Hooks', 'State Management', 'Performance', 'Next.js specific'] },
  { id: 'react-native', title: 'React Native Exam', topics: ['Basics', 'Hooks', 'State Management', 'React Native specific'] },
];
