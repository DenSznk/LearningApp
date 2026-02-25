import { Suspense } from 'react';
import Link from 'next/link';
import { fetchSkillSets } from '@/lib/api';
import { QuestionList } from '@/components/questions/QuestionList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function TopicQuestionsPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: rawTopic } = await params;
  const topic = decodeURIComponent(rawTopic);
  let skillSets: any[] = [];

  try {
      // Fetch all and filter by topic
      const allSkillSets = await fetchSkillSets();
      skillSets = allSkillSets.filter((s: any) => s.topic === topic);
  } catch (error) {
      console.error("Failed to fetch skill sets", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/questions">
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold tracking-tight capitalize">{topic}</h1>
            <p className="text-muted-foreground">{skillSets.length} themes available</p>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <QuestionList skillSets={skillSets} topic={topic} showControls={false} />
      </Suspense>
    </div>
  );
}
