import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Hardcoded data from src/lib/data.ts to avoid import complexity with TS/Modules
const DATA = {
  EXAMS: [
    { id: 'react', title: 'React Exam', topics: ['Basics', 'Hooks', 'State Management', 'Performance', 'Next.js specific'] },
    { id: 'react-native', title: 'React Native Exam', topics: ['Basics', 'Hooks', 'State Management', 'React Native specific'] },
  ],
  QUESTIONS: [
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
    {
      id: 'react-state-1',
      text: 'What is the difference between specific state types (Local vs Global)?',
      topic: 'State Management',
      difficulty: 'easy',
    },
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
  ]
};

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clear existing data
  await prisma.userGrade.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.exam.deleteMany();

  // Create Exams and Topics
  for (const examData of DATA.EXAMS) {
    const exam = await prisma.exam.create({
      data: {
        id: examData.id,
        title: examData.title,
      },
    });

    for (const topicName of examData.topics) {
      await prisma.topic.create({
        data: {
          name: topicName,
          examId: exam.id,
        },
      });
    }
  }

  // Create Questions
  // We need to find the topic ID for each question
  for (const q of DATA.QUESTIONS) {
    // Find which exam this topic belongs to.
    // In our simple model, topics might be duplicated across exams or we need to know which exam the question belongs to.
    // The data structure in `data.ts` wasn't perfectly normalized.
    // For now, we'll try to find the topic in ANY exam.
    // Ideally, questions should belong to a specific context, but here `Basics` exists in both.
    // Logic: Find the first topic with matching name.

    // Improving logic: Check if question ID suggests exam (react-* vs rn-*)?
    // Or just pick the first topic found.
    // "React Native specific" is unique. "Basics" is shared.

    // Heuristic:
    let examId = 'react';
    if (q.id.startsWith('rn-')) examId = 'react-native';

    const topic = await prisma.topic.findFirst({
      where: {
        name: q.topic,
        examId: examId
      }
    });

    if (topic) {
      await prisma.question.create({
        data: {
          id: q.id,
          text: q.text,
          difficulty: q.difficulty,
          topicId: topic.id,
        }
      });
    } else {
        console.warn(`Topic ${q.topic} not found for question ${q.id} in exam ${examId}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
