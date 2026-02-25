import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

type Level = 1 | 2 | 3 | 4 | 5;

interface RawLevel {
  skill: string;
  question: string;
  answer?: string;
}

interface RawTopicData {
  topic: string;
  theme: string;
  week: string;
  shortAnswer?: string;
  codeExample?: string;
  levels: {
    [key: string]: RawLevel;
  };
}

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');


  const jsonPath = path.join(__dirname, '../../RN_Matrix_Final_Corrected.json');
  console.log(`Loading data from ${jsonPath}`);
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as RawTopicData[];

  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.exam.deleteMany();

  console.log('Database cleared.');

  for (const item of rawData) {
    const examId = item.topic.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    await prisma.exam.upsert({
      where: { id: examId },
      update: {},
      create: {
        id: examId,
        title: item.topic,
      },
    });

    const topicName = item.theme.trim();
    if (!topicName) continue;
    let topic = await prisma.topic.findFirst({
      where: {
        name: topicName,
        examId: examId,
      },
    });

    if (!topic) {
      topic = await prisma.topic.create({
        data: {
          name: topicName,
          examId: examId,
          week: item.week,
          shortAnswer: item.shortAnswer || null,
          codeExample: item.codeExample || null,
        },
      });
    } else {
        await prisma.topic.update({
            where: { id: topic.id },
            data: {
                week: item.week,
                shortAnswer: item.shortAnswer || null,
                codeExample: item.codeExample || null,
            }
        });
    }

    for (const [levelKey, levelData] of Object.entries(item.levels)) {
        // Fallback to skill if question is empty, or use a placeholder
        const textToSave = levelData.question?.trim() || levelData.skill?.trim() || "No question provided";

        const levelNum = parseInt(levelKey);
        let difficulty = 'easy';
        if (levelNum === 2) difficulty = 'medium';
        if (levelNum === 3) difficulty = 'hard';
        if (levelNum >= 4) difficulty = 'expert';

        const themeSlug = topicName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50); // limit length
        const questionId = `${examId}-${themeSlug}-${levelKey}`;

        await prisma.question.upsert({
            where: { id: questionId },
            update: {
                text: textToSave,
                difficulty,
                answer: levelData.answer || null,
                week: item.week,
                skill: levelData.skill,
                level: levelNum,
                topicId: topic.id,
            },
            create: {
                id: questionId,
                text: textToSave,
                difficulty,
                answer: levelData.answer || null,
                week: item.week,
                skill: levelData.skill,
                level: levelNum,
                topicId: topic.id,
            }
        });
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
