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
      where.topic = {
        ...where.topic,
        examId: examId
      };
    }

    // Search by Theme (stored as Topic.name) or Text
    const { search } = req.query;
    if (search) {
      where.OR = [
        { topic: { name: { contains: search } } },
        { text: { contains: search } }
      ];
    }

    let questions = await prisma.question.findMany({
      where,
      include: {
          topic: {
              include: {
                  exam: true
              }
          }
      }
    });

    // Deduplicate by Topic (Theme) and group all levels
    // We want one card per Theme. We prefer Level 1 as the representative.
    const groupedQuestionsMap = new Map();

    for (const q of questions) {
        const existing = groupedQuestionsMap.get(q.topicId);
        if (!existing) {
            // Initialize with this question as representative, and start the levels array
            groupedQuestionsMap.set(q.topicId, {
                representative: q,
                levels: [q]
            });
        } else {
            // Add to levels array
            existing.levels.push(q);

            // Update representative if this one is Level 1 (or lower than current representative)
            if (q.level === 1 && existing.representative.level !== 1) {
                existing.representative = q;
            } else if (q.level < existing.representative.level) {
                 existing.representative = q;
            }
        }
    }

    // Sort levels for each group
    for (const group of groupedQuestionsMap.values()) {
        group.levels.sort((a, b) => a.level - b.level);
    }

    questions = Array.from(groupedQuestionsMap.values());

    // Randomize and limit
    // Note: Database level random() is driver specific.
    // For SQLite `ORDER BY RANDOM()` works but Prisma doesn't support it natively in `findMany` easily without raw query.
    // For small dataset, shuffling in memory is fine.

    questions = questions.sort(() => 0.5 - Math.random());

    if (limit) {
      questions = questions.slice(0, parseInt(limit));
    }

    // Format for frontend
    const formatted = questions.map(group => {
      const q = group.representative;
      return {
        id: q.id,
        text: q.text,
        difficulty: q.difficulty,
        topic: q.topic.exam.title, // "JavaScript" (Exam Title)
        theme: q.topic.name,       // "Event Loop" (Topic Name)
        answer: q.answer,
        week: q.week,
        skill: q.skill,
        level: q.level,
        levels: group.levels.map(l => ({
            id: l.id,
            text: l.text,
            difficulty: l.difficulty,
            answer: l.answer,
            skill: l.skill,
            level: l.level
        }))
      };
    });

    res.json(formatted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET /api/skillsets
// Returns list of skill sets (Themes)
app.get('/api/skillsets', async (req, res) => {
    try {
        const topics = await prisma.topic.findMany({
            include: { exam: true }
        });

        const formatted = topics.map(t => ({
            id: t.id,
            topic: t.exam.title,
            theme: t.name,
            week: t.week
        }));

        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch skill sets' });
    }
});

// GET /api/skillsets/:id
// Returns details of a specific skill set (Theme) including all levels
app.get('/api/skillsets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await prisma.topic.findUnique({
            where: { id },
            include: {
                exam: true,
                questions: true
            }
        });

        if (!topic) {
            return res.status(404).json({ error: 'Skill set not found' });
        }

        // Format levels object: { "1": { skill, question }, "2": ... }
        const levels = {};
        topic.questions.forEach(q => {
            levels[q.level] = {
                skill: q.skill,
                question: q.text,
                answer: q.answer
            };
        });

        const formatted = {
            id: topic.id,
            topic: topic.exam.title,
            theme: topic.name,
            week: topic.week,
            shortAnswer: topic.shortAnswer,
            codeExample: topic.codeExample,
            levels
        };

        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch skill set details' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
