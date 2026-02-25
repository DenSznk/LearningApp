const API_URL = 'http://localhost:3001/api';

export async function fetchExams() {
  const res = await fetch(`${API_URL}/exams`);
  if (!res.ok) throw new Error('Failed to fetch exams');
  return res.json();
}

export async function fetchQuestions(examId?: string, topic?: string, difficulty?: string, limit?: number, search?: string) {
  const params = new URLSearchParams();
  if (examId) params.append('examId', examId);
  if (topic && topic !== 'all') params.append('topic', topic);
  if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);
  if (limit) params.append('limit', limit.toString());
  if (search) params.append('search', search);

  const res = await fetch(`${API_URL}/questions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

export async function fetchGrades() {
  // TODO: Implement actual grade fetching from backend
  return { grades: {} };
}

export async function fetchSkillSets() {
  const res = await fetch(`${API_URL}/skillsets`);
  if (!res.ok) throw new Error('Failed to fetch skill sets');
  return res.json();
}

export async function fetchSkillSet(id: string) {
  const res = await fetch(`${API_URL}/skillsets/${id}`);
  if (!res.ok) throw new Error('Failed to fetch skill set');
  return res.json();
}
