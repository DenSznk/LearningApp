import Link from 'next/link';
import { fetchQuestions } from '@/lib/api';
import { QuestionList } from '@/components/questions/QuestionList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function TopicQuestionsPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: rawTopic } = await params;
  const topic = decodeURIComponent(rawTopic);
  let questions = [];

  try {
      // Use 'all' for difficulty and adjust limit to something high or add pagination later
      questions = await fetchQuestions(undefined, topic, 'all', 100);
  } catch (error) {
      console.error("Failed to fetch questions", error);
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
            <p className="text-muted-foreground">{questions.length} questions available</p>
        </div>
      </div>

      <QuestionList questions={questions} topic={topic} />
    </div>
  );
}
