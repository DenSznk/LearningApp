const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, 'questions.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const blocks = JSON.parse(rawData);

  console.log(`Found ${blocks.length} topic blocks.`);

  for (const block of blocks) {
    console.log(`Processing Topic: ${block.topic}...`);

    // 1. Upsert Exam (Default to "General" if not provided, or use block.exam)
    const examTitle = block.exam || "General Exam";
    const examId = examTitle.toLowerCase().replace(/\s+/g, '-');

    await prisma.exam.upsert({
      where: { id: examId },
      update: {},
      create: {
        id: examId,
        title: examTitle
      }
    });

    // 2. Upsert Topic
    // We need to find if it exists linked to this exam.
    // Since id is random CUID, we find by composite unique constraint or name if possible.
    // Our schema has @@unique([examId, name]) for Topic.

    const topic = await prisma.topic.upsert({
      where: {
        examId_name: {
          examId: examId,
          name: block.topic
        }
      },
      update: {},
      create: {
        name: block.topic,
        examId: examId
      }
    });

    // 3. Upsert Questions
    for (const q of block.questions) {
      // Generate a deterministic ID based on text hash or just use random if we don't care about updates matching exactly.
      // To strictly support "update answers", we ideally need a stable ID in JSON.
      // For now, let's use a simple slug from text.
      const qId = q.text.substring(0, 30).toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 5);

      // Actually, if we want to UPDATE, using random ID implies we always create new ones or need to clear old ones.
      // A better approach for a simple seeder: Wipe questions for this topic and recreate?
      // OR mostly likely the user wants to add/correct.
      // Let's assume we create new ones for now, OR try to find by text.

      // Simpler for this verified step: Create.
      // But let's try to map by text to avoid duplicates if run twice.

      const existing = await prisma.question.findFirst({
        where: {
          topicId: topic.id,
          text: q.text
        }
      });

      if (existing) {
        await prisma.question.update({
          where: { id: existing.id },
          data: {
            difficulty: q.difficulty,
            answer: q.answer,
            week: q.week
          }
        });
      } else {
        await prisma.question.create({
          data: {
            id: qId,
            text: q.text,
            difficulty: q.difficulty,
            answer: q.answer,
            week: q.week,
            topicId: topic.id
          }
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
