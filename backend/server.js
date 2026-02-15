require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// GET /api/exams
// Returns all exams with their topics
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        topics: true
      }
    });

    const formatted = exams.map(e => ({
      id: e.id,
      title: e.title,
      topics: e.topics.map(t => t.name)
    }));

    res.json(formatted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// GET /api/questions
// Filters: examId (optional), topic (optional), difficulty (optional), limit (optional)
app.get('/api/questions', async (req, res) => {
  try {
    const { examId, topic, difficulty, limit } = req.query;

    const where = {};

    // Filter by Topic Name
    if (topic && topic !== 'all') {
      where.topic = { name: topic };
    }

    // Filter by Difficulty
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    // Filter by Exam (implicit: questions -> topic -> examId)
    if (examId) {
      // If we already filtered by topic, we might not need this if topics are unique to exams,
      // but they are loosely coupled in our seed logic.
      // Better to check:
      where.topic = {
        ...where.topic,
        examId: examId
      };
    }

    let questions = await prisma.question.findMany({
      where,
      include: { topic: true }
    });

    // Randomize and limit
    // Note: Database level random() is driver specific.
    // For SQLite `ORDER BY RANDOM()` works but Prisma doesn't support it natively in `findMany` easily without raw query.
    // For small dataset, shuffling in memory is fine.

    questions = questions.sort(() => 0.5 - Math.random());

    if (limit) {
      questions = questions.slice(0, parseInt(limit));
    }

    // Format for frontend
    const formatted = questions.map(q => ({
      id: q.id,
      text: q.text,
      difficulty: q.difficulty,
      topic: q.topic.name,
      answer: q.answer,
      week: q.week
    }));

    res.json(formatted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
