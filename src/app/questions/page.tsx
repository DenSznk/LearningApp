import Link from 'next/link';
import { fetchExams } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen } from 'lucide-react';

export default async function QuestionsPage() {
  let topics: string[] = [];
  try {
    const exams: any[] = await fetchExams();
    // Extract unique topics from all exams
    const allTopics = exams.flatMap(e => e.topics);
    topics = Array.from(new Set(allTopics));
  } catch (error) {
    console.error("Failed to load topics", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 space-y-2">
         <h1 className="text-3xl font-bold tracking-tight">All Topics</h1>
         <p className="text-muted-foreground">Browse questions by topic to practice specific concepts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map(topic => (
          <Link key={topic} href={`/questions/${topic}`} className="group">
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 group-hover:border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold capitalize">
                  {topic}
                </CardTitle>
                <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                 <div className="flex items-center text-sm text-muted-foreground mt-4 group-hover:text-foreground transition-colors">
                    View Questions <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                 </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {topics.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No topics found. Please seed the database.
          </div>
        )}
      </div>
    </div>
  );
}
