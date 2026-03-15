"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QuestionCard } from './QuestionCard';
import { Question } from '@/lib/data';
import { fetchQuestions, fetchExams } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

type Phase = 'setup' | 'run' | 'finish';

interface ExamRunnerProps {
  examId: string;
}

export function ExamRunner({ examId }: ExamRunnerProps) {
  const router = useRouter();
  const [exam, setExam] = React.useState<{id: string, title: string, topics: string[]} | null>(null);
  const [phase, setPhase] = React.useState<Phase>('setup');

  // Setup State
  const [selectedTopic, setSelectedTopic] = React.useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('all');

  // Run State
  const [examQuestions, setExamQuestions] = React.useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
      fetchExams().then(exams => {
          const found = exams.find((e: any) => e.id === examId);
          if (found) setExam(found);
      });
  }, [examId]);

  if (!exam) return <div>Loading exam...</div>;

  const startExam = async () => {
    setLoading(true);
    try {
        const questions = await fetchQuestions(
            examId,
            selectedTopic,
            selectedDifficulty,
            15
        );

        if (questions.length === 0) {
            alert("No questions matching criteria!");
            setLoading(false);
            return;
        }

        setExamQuestions(questions);
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
        setPhase('run');
    } catch (e) {
        alert("Failed to start exam");
    } finally {
        setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setPhase('finish');
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  // --- RENDERERS ---

  if (phase === 'setup') {
    return (
      <Card className="w-full max-w-md mx-auto border-none shadow-xl">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">{exam.title} Setup</h2>
            <p className="text-muted-foreground">Customize your session</p>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
               <Label>Topic</Label>
               <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                 <SelectTrigger>
                   <SelectValue placeholder="All Topics" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Topics</SelectItem>
                   {exam.topics.map(t => (
                     <SelectItem key={t} value={t}>{t}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <Label>Difficulty</Label>
               <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                 <SelectTrigger>
                   <SelectValue placeholder="Any Difficulty" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Any Difficulty</SelectItem>
                   <SelectItem value="easy">Easy</SelectItem>
                   <SelectItem value="medium">Medium</SelectItem>
                   <SelectItem value="hard">Hard</SelectItem>
                 </SelectContent>
               </Select>
             </div>
          </div>

          <Button className="w-full" size="lg" onClick={startExam} disabled={loading}>
            {loading ? 'Generating...' : 'Start Exam'}
          </Button>

           <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'run') {
    const question = examQuestions[currentQuestionIndex];
    const progressVal = ((currentQuestionIndex) / examQuestions.length) * 100;

    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300" key={currentQuestionIndex}>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {examQuestions.length}</span>
          <Button variant="ghost" size="sm" onClick={() => setPhase('setup')}>Abort</Button>
        </div>
        <Progress value={progressVal} className="h-2" />

        <QuestionCard
          question={question}
        />

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={nextQuestion}>
            {currentQuestionIndex === examQuestions.length - 1 ? 'Finish Exam' : 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'finish') {
    return (
      <div className="space-y-8 max-w-md mx-auto text-center animate-in zoom-in-95 duration-300">
         <Card className="border-none shadow-xl p-8 space-y-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                 <RotateCcw className="w-8 h-8" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Session Complete!</h2>
                <p className="text-muted-foreground">You have gone through all {examQuestions.length} questions.</p>
            </div>

            <div className="space-y-3">
                <Button className="w-full" onClick={() => setPhase('setup')}>
                    Start New Session
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
                    Back to Home
                </Button>
            </div>
         </Card>
      </div>
    );
  }

  return null;
}
