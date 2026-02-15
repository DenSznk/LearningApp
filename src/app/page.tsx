import { ExamCard } from '@/components/exam/ExamCard';
import { fetchExams } from '@/lib/api';

// Define the type locally or import if shared
interface Exam {
    id: string;
    title: string;
    topics: string[];
}

export default async function Home() {
  let exams: Exam[] = [];
  try {
      exams = await fetchExams();
  } catch (error) {
      console.error("Failed to load exams", error);
      // Fallback or empty state
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-background to-cyan-500/5 pointer-events-none" />

      <main className="relative container mx-auto px-4 py-16 md:py-24">
         <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
             <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                 Interview Mastery
             </h1>
             <p className="text-xl text-muted-foreground">
                 Prepare for your next technical interview with structured learning matrices and self-graded exams.
             </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {exams.map(exam => (
                 <ExamCard key={exam.id} id={exam.id} title={exam.title} topics={exam.topics} />
             ))}

             <div className="border-2 border-dashed border-muted rounded-xl flex items-center justify-center p-8 opacity-50 hover:opacity-100 transition-opacity">
                 <span className="text-muted-foreground font-medium">More Exams Coming Soon</span>
             </div>
         </div>
      </main>
    </div>
  );
}
