"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchExams, fetchGrades, fetchQuestions } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Shadcn utility

interface MatrixGridProps {
  examId: string;
}

const GRADE_COLORS: Record<number, string> = {
  0: 'bg-muted text-muted-foreground',
  1: 'bg-red-500/20 text-red-500 hover:bg-red-500/30',
  2: 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30',
  3: 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30',
  4: 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30',
  5: 'bg-green-500/20 text-green-500 hover:bg-green-500/30',
};

export function MatrixGrid({ examId }: MatrixGridProps) {
  const [grades, setGrades] = React.useState<Record<string, number>>({});
  const [exam, setExam] = React.useState<{id: string, title: string, topics: string[]} | null>(null);
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
        try {
            const [examsData, gradesData, questionsData] = await Promise.all([
                fetchExams(),
                fetchGrades(),
                fetchQuestions(examId) // Fetch all questions for this exam
            ]);

            setExam(examsData.find((e: any) => e.id === examId));
            setGrades(gradesData.grades);
            setQuestions(questionsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [examId]);

  if (loading) return <div>Loading matrix...</div>;
  if (!exam) return <div>Exam not found</div>;

  const getQuestionsForTopic = (topicName: string) => {
    return questions.filter((q: any) => q.topic === topicName);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {exam.topics.map((topic) => {
        const topicQuestions = getQuestionsForTopic(topic);
        const answeredCount = topicQuestions.filter(q => (grades[q.id] || 0) > 0).length;
        const totalCount = topicQuestions.length;

        return (
          <Card key={topic} className="flex flex-col overflow-hidden border-none shadow-md bg-secondary/20 backdrop-blur-sm animate-in slide-in-from-bottom-5 fade-in duration-700 fill-mode-both" style={{ animationDelay: `${Math.random() * 200}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">{topic}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {answeredCount}/{totalCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2">
                {topicQuestions.map((q: any) => {
                  const grade = grades[q.id] || 0;
                  return (
                    <div key={q.id} className="flex items-center justify-between group">
                       <span className="text-sm truncate mr-2 text-muted-foreground group-hover:text-foreground transition-colors">
                         {q.text}
                       </span>
                       <Badge className={cn("w-6 h-6 flex items-center justify-center p-0 rounded-full cursor-default shrink-0", GRADE_COLORS[grade])}>
                         {grade === 0 ? '-' : grade}
                       </Badge>
                    </div>
                  );
                })}
                {topicQuestions.length === 0 && <div className="text-muted-foreground text-sm italic">No questions yet</div>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
