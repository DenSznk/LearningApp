"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/lib/data';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface QuestionCardProps {
  question: Question;
  className?: string;
}

export function QuestionCard({ question, className }: QuestionCardProps) {
  const markdownComponents = {
    code({node, inline, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          {...props}
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.875rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code {...props} className={cn("bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm", className)}>
          {children}
        </code>
      )
    }
  };

  return (
    <Card className={cn("w-full max-w-none mx-auto border shadow-none bg-background", className)}>
      <CardHeader>
        <div className="flex justify-between items-start mb-4 gap-2">
           <div className="flex flex-col gap-1">
             <Badge variant="outline" className="text-xs uppercase tracking-wider w-fit">{question.topic}</Badge>
             <span className="text-xs text-muted-foreground font-medium">{question.theme}</span>
           </div>

           <div className="flex gap-2">
             {question.week && <Badge variant="secondary" className="text-xs tracking-wider">{question.week}</Badge>}
             <Badge variant={question.difficulty === 'hard' || question.difficulty === 'expert' ? 'destructive' : question.difficulty === 'medium' ? 'default' : 'secondary'}>
               {question.difficulty}
             </Badge>
           </div>
        </div>
        <CardTitle className="text-2xl font-bold leading-tight">{question.text}</CardTitle>
        {question.skill && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
            <span className="font-semibold block text-xs uppercase mb-1">Key Skills:</span>
            {question.skill}
          </div>
        )}
        {question.shortAnswer && (
          <div className="mt-4 p-5 bg-muted/40 border rounded-lg text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <span className="font-semibold block mb-2 text-foreground">Key Definition</span>
            <ReactMarkdown components={markdownComponents}>{question.shortAnswer}</ReactMarkdown>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Placeholder for answers or thoughts removed */}

        {question.codeExample && (
          <div className="mb-6 rounded-lg overflow-hidden border">
            <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800">
               <span className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">Code Example</span>
            </div>
            <ReactMarkdown components={markdownComponents}>
              {question.codeExample}
            </ReactMarkdown>
          </div>
        )}

        {!question.shortAnswer && !question.codeExample && question.answer && (
          <div className="mt-6 p-5 bg-muted/40 border rounded-lg text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
           <span className="font-semibold block mb-2 text-foreground">Answer</span>
           <ReactMarkdown components={markdownComponents}>{question.answer}</ReactMarkdown>
          </div>
        )}
        {question.answer && (question.shortAnswer || question.codeExample) && (
          <div className="p-5 bg-muted/40 border rounded-lg text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
           <span className="font-semibold block mb-2 text-foreground">Answer</span>
           <ReactMarkdown components={markdownComponents}>{question.answer}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
