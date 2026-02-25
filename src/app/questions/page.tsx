import { Suspense } from 'react';
import { fetchSkillSets } from '@/lib/api';
import { QuestionList } from '@/components/questions/QuestionList';

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  let skillSets: any[] = [];
  try {
    skillSets = await fetchSkillSets();
  } catch (error) {
    console.error("Failed to load skill sets", error);
  }

  // Filter if search is present (client-side filter for now)
  const filtered = search
      ? skillSets.filter((s: any) =>
          s.theme.toLowerCase().includes(search.toLowerCase()) ||
          s.topic.toLowerCase().includes(search.toLowerCase())
        )
      : skillSets;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
       <div className="mb-8 space-y-2">
         <h1 className="text-3xl font-bold tracking-tight">All Questions</h1>
         <p className="text-muted-foreground">Browse all interview questions by topic to practice specific concepts.</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <QuestionList skillSets={filtered} topic="All" showControls={true} />
      </Suspense>
    </div>
  );
}
