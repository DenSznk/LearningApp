
export type Level = 1 | 2 | 3 | 4 | 5;
export type KnowledgeGrade = 0 | 1 | 2 | 3 | 4 | 5; // 0 = unattempted/unknown

export interface Question {
  id: string;
  text: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  answer?: string;
  week?: string;
  theme: string;
  skill?: string;
  level: Level;
  levels?: Question[];
  shortAnswer?: string;
  codeExample?: string;
}

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

export interface SkillSet {
  id: string;
  topic: string;
  theme: string;
  week?: string;
  shortAnswer?: string;
  codeExample?: string;
  levels?: {
    [key: string]: {
      skill: string;
      question: string;
      answer?: string;
    }
  };
}

export const TOPICS = [
  'Common',
  'JavaScript',
  'TypeScript',
  'Browser',
  'React',
] as const;

export type TopicName = typeof TOPICS[number];
