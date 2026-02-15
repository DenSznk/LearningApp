"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/lib/data';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  showAnswer?: boolean;
  onToggleAnswer?: () => void;
  className?: string;
}

export function QuestionCard({ question, showAnswer, onToggleAnswer, className }: QuestionCardProps) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto border-none shadow-xl bg-gradient-to-br from-background to-secondary/30", className)}>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
           <Badge variant="outline" className="text-xs uppercase tracking-wider">{question.topic}</Badge>
           {question.week && <Badge variant="secondary" className="text-xs tracking-wider">{question.week}</Badge>}
           <Badge variant={question.difficulty === 'hard' ? 'destructive' : question.difficulty === 'medium' ? 'default' : 'secondary'}>
             {question.difficulty}
           </Badge>
        </div>
        <CardTitle className="text-2xl font-bold leading-tight">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Placeholder for answers or thoughts */}
        <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed border-muted rounded-xl p-8 text-muted-foreground">
           Think about your answer...
        </div>

        {onToggleAnswer && (
            <div className="mt-8 flex justify-center">
                <Button variant="ghost" onClick={onToggleAnswer}>
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </Button>
            </div>
        )}

        {showAnswer && (
           <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm animate-in fade-in slide-in-from-bottom-2">
              <span className="font-semibold block mb-1">Answer:</span>
              {question.answer || "No answer provided."}
           </div>
        )}
      </CardContent>
    </Card>
  );
}
