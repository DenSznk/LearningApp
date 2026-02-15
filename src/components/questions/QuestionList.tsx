"use client";

import { useState } from 'react';
import { Question } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface QuestionListProps {
  questions: Question[];
  topic: string;
}

export function QuestionList({ questions }: QuestionListProps) {
  const [search, setSearch] = useState('');

  const filtered = questions.filter(q =>
    q.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          className="pl-9 bg-background/50 backdrop-blur-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((q) => (
          <QuestionListItem key={q.id} question={q} />
        ))}

        {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No questions found matching your search.
            </div>
        )}
      </div>
    </div>
  );
}

function QuestionListItem({ question }: { question: Question }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Dialog onOpenChange={(open) => !open && setShowAnswer(false)}>
      <DialogTrigger asChild>
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-primary group">
          <CardContent className="p-4 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {question.text}
              </div>
              <div className="flex gap-2">
                  {question.week && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{question.week}</Badge>}
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
                      {question.difficulty}
                  </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-transparent border-none shadow-none p-0 sm:max-w-3xl">
          <QuestionCard
              question={question}
              showAnswer={showAnswer}
              onToggleAnswer={() => setShowAnswer(!showAnswer)}
              className="shadow-2xl"
          />
      </DialogContent>
    </Dialog>
  );
}
