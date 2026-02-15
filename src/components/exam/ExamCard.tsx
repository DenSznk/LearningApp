"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BarChart } from 'lucide-react';

interface ExamCardProps {
  id: string;
  title: string;
  topics: string[];
}

export function ExamCard({ id, title, topics }: ExamCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-none bg-secondary/10 hover:bg-secondary/20 group hover:-translate-y-1 animate-in fade-in zoom-in-95 duration-500 fill-mode-both">
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          {title}
          <BarChart className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardTitle>
        <CardDescription>
            {topics.length} Topics Available
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-6">
            {topics.slice(0, 3).map(t => (
                <Badge key={t} variant="secondary" className="bg-background/50">{t}</Badge>
            ))}
            {topics.length > 3 && <Badge variant="outline">+{topics.length - 3} more</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-3">

            <Link href={`/exam/${id}`} className="w-full">
                <Button className="w-full group-hover:bg-primary/90">
                     Start Exam <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
