import { ExamRunner } from '@/components/exam/ExamRunner';

interface PageProps {
  params: Promise<{
    examId: string;
  }>;
}

export default async function ExamPage({ params }: PageProps) {
  const { examId } = await params;
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl pt-8">
        <ExamRunner examId={examId} />
      </div>
    </div>
  );
}
