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
            coreConcept: topic.coreConcept,
            levels
        };

        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch skill set details' });
    }
});

// POST /api/agent/generate-task
// Generates a new practice task using AI
app.post('/api/agent/generate-task', async (req, res) => {
    try {
        const { topicId, difficulty, taskType } = req.body;

        if (!topicId || !difficulty || !taskType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const topic = await prisma.topic.findUnique({
            where: { id: topicId },
            include: { exam: true }
        });

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // Fetch past tasks to avoid repetition
        const pastTasks = await prisma.practiceTask.findMany({
            where: { topicId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const pastPromptsContext = pastTasks.length > 0
            ? `\n\nCRITICAL: To ensure a varied assessment experience, you MUST NOT generate any task that is conceptually similar to these past tasks given for this topic:\n${pastTasks.map((t, i) => `${i+1}. ${t.prompt}`).join('\n')}`
            : '';

        const systemPrompt = `You are an elite Staff-Level Technical Interviewer at a top-tier tech company.
You are assessing a candidate on the subject of "${topic.exam.title}", specifically focusing on the topic of "${topic.name}".
Your goal is to generate a highly realistic, practical, and nuanced coding challenge or discussion topic.

PARAMETERS:
- Difficulty: ${difficulty} (Adjust complexity, edges cases, and expected depth of knowledge accordingly)
- Task Type: ${taskType}

DIRECTIONS:
1. The task must test actual understanding, not just trivia memorization.
2. If the task type is "Find the Bug" or "Refactor this Code", provide a realistic, slightly messy 'candidateCode' snippet.
3. If the task type is "Predict Execution Output", provide a tricky piece of code in 'candidateCode', and ask the candidate to predict the exact execution order or console output.
4. If the task type is "Build from Scratch" or "System Design Snippet", the 'candidateCode' can be empty or just basic scaffolding.
5. The 'interviewerSolution' must be an excellent resource for the human interviewer. It MUST include:
   - The optimal solution (with brief code if applicable).
   - 2 to 3 very specific "Red Flags" or common pitfalls to watch out for in the candidate's answer.
   - 1 probing follow-up question to test if they truly understand the underlying mechanics.

CRITICAL FORMATTING INSTRUCTIONS:
You MUST output exactly one XML block wrapped in <practiceTask>.
DO NOT output JSON. DO NOT wrap the output in markdown code blocks like \`\`\`json.
Your entire response MUST look EXACTLY like this structure:

<practiceTask>
<prompt>
Your candidate scenario here.
</prompt>

<candidateCode>
Your initial code snippet here (or empty line if none).
</candidateCode>

<interviewerSolution>
Your interviewer cheat sheet here, beautifully formatted with markdown.
</interviewerSolution>
</practiceTask>
${pastPromptsContext}`;

        // Initialize Anthropic (requires ANTHROPIC_API_KEY in .env)
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic(); // Automatically uses process.env.ANTHROPIC_API_KEY

        const completion = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 2000,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
                { role: "user", content: "Generate the interview task cleanly formatted with the XML tags." }
            ]
        });

        // Parse Anthropic response
        const responseText = completion.content[0].text;

        let aiResponse = { prompt: "", candidateCode: "", interviewerSolution: "" };

        // 1. Try XML Tag Parsing First
        const extractTag = (tag, text) => {
            const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i');
            const match = text.match(regex);
            return match ? match[1].trim() : "";
        };

        const aiPrompt = extractTag("prompt", responseText);
        const aiCandidateCode = extractTag("candidateCode", responseText);
        const aiInterviewerSolution = extractTag("interviewerSolution", responseText);

        if (aiPrompt || aiInterviewerSolution) {
            aiResponse.prompt = aiPrompt;
            aiResponse.candidateCode = aiCandidateCode;
            aiResponse.interviewerSolution = aiInterviewerSolution;
        } else {
            // 2. Fallback: It ignored XML and output JSON anyway
            try {
                 let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                 let parsedJson = JSON.parse(cleanText);
                 aiResponse.prompt = parsedJson.prompt || "";
                 aiResponse.candidateCode = parsedJson.candidateCode || "";
                 aiResponse.interviewerSolution = parsedJson.interviewerSolution || "";
            } catch (initialParseError) {
                 try {
                     const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                     if (jsonMatch && jsonMatch[1]) {
                         let parsedJson = JSON.parse(jsonMatch[1].trim());
                         aiResponse.prompt = parsedJson.prompt || "";
                         aiResponse.candidateCode = parsedJson.candidateCode || "";
                         aiResponse.interviewerSolution = parsedJson.interviewerSolution || "";
                     } else {
                         throw new Error("No JSON or XML tags found.");
                     }
                 } catch (fallbackError) {
                     console.error("RAW ANTHROPIC RESPONSE THAT FAILED TO PARSE:", responseText);
                     throw new Error("Failed to extract necessary XML tags or fallback JSON from AI response. Check server logs.");
                 }
            }
        }

        if (!aiResponse.prompt || !aiResponse.interviewerSolution) {
             console.error("RAW ANTHROPIC RESPONSE THAT FAILED TO PARSE:", responseText);
             throw new Error("Generated task is empty or missing critical fields.");
        }

        // Save to database
        const newTask = await prisma.practiceTask.create({
            data: {
                topicId,
                prompt: aiResponse.prompt,
                candidateCode: aiResponse.candidateCode || "",
                interviewerSolution: aiResponse.interviewerSolution,
                difficulty,
                taskType
            }
        });

        res.json(newTask);

    } catch (e) {
        console.error("Agent Error:", e);
        res.status(500).json({
            error: 'Failed to generate task',
            details: e.message
        });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
