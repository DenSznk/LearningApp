"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SkillSet, TOPICS } from '@/lib/data';
import { fetchSkillSet } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QuestionCardSkeleton } from '@/components/exam/QuestionCardSkeleton';
import GenerateTaskPanel from '@/components/GenerateTaskPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils';

interface QuestionListProps {
  skillSets: SkillSet[];
  topic: string;
  showControls?: boolean;
}


export function QuestionList({ skillSets, showControls = true }: QuestionListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showControls) {
          const params = new URLSearchParams(searchParams.toString());
          const currentSearch = params.get('search') || '';

          if (search !== currentSearch) {
              if (search) {
                  params.set('search', search);
              } else {
                  params.delete('search');
              }
              router.push(`?${params.toString()}`);
          }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, showControls, router, searchParams]);

  const [selectedSkillSet, setSelectedSkillSet] = useState<SkillSet | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicFilter, setTopicFilter] = useState('all');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const uniqueTopics = Array.from(new Set(skillSets.map(s => s.topic))).sort();

  const sorted = [...skillSets]
    .filter(s => topicFilter === 'all' || s.topic === topicFilter);

  const handleOpen = async (skillSet: SkillSet) => {
    setIsModalOpen(true);
    setIsLoadingDetails(true);
    try {
        const details = await fetchSkillSet(skillSet.id);
        setSelectedSkillSet(details);
        setSelectedLevelId('1');
    } catch (e) {
        console.error("Failed to fetch details", e);
    } finally {
        setIsLoadingDetails(false);
    }
  };

  const handleNext = () => {
    if (!selectedSkillSet) return;
    const currentIndex = sorted.findIndex(q => q.id === selectedSkillSet.id);
    if (currentIndex < sorted.length - 1) {
      handleOpen(sorted[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!selectedSkillSet) return;
    const currentIndex = sorted.findIndex(q => q.id === selectedSkillSet.id);
    if (currentIndex > 0) {
      handleOpen(sorted[currentIndex - 1]);
    }
  };

  let activeQuestion = null;
  if (selectedSkillSet && selectedSkillSet.levels && selectedLevelId) {
      const levelData = selectedSkillSet.levels[selectedLevelId];
      if (levelData) {
          activeQuestion = {
              id: `${selectedSkillSet.id}-${selectedLevelId}`,
              text: levelData.question,
              topic: selectedSkillSet.topic,
              theme: selectedSkillSet.theme,
              difficulty: 'easy',
              skill: levelData.skill,
              shortAnswer: selectedSkillSet.shortAnswer,
              codeExample: selectedSkillSet.codeExample,
              coreConcept: selectedSkillSet.coreConcept,
              answer: levelData.answer,
          };
      }
  }

  const currentIndex = selectedSkillSet ? sorted.findIndex(q => q.id === selectedSkillSet.id) : -1;
  const hasNext = currentIndex < sorted.length - 1;
  const hasPrev = currentIndex > 0;

  if (selectedSkillSet) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>Question {currentIndex + 1} of {sorted.length}</span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedSkillSet(null)}>
            Back to Questions
          </Button>
        </div>

        {isLoadingDetails ? (
           <QuestionCardSkeleton />
        ) : !activeQuestion ? (
           <div className="p-8 text-center bg-card border rounded-lg">
             No question available for this level.
           </div>
        ) : (
          <div className="space-y-6 bg-card border rounded-lg shadow-sm overflow-hidden">
             <div className="p-4 border-b bg-muted/20 flex gap-2 flex-wrap">
                 {Object.keys(selectedSkillSet.levels || {}).map((levelKey) => (
                     <Button
                        key={levelKey}
                        variant={selectedLevelId === levelKey ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedLevelId(levelKey)}
                        className="text-xs"
                     >
                        Level {levelKey}
                     </Button>
                 ))}
             </div>

             <div className="p-4">
               <QuestionCard
                   question={activeQuestion as any}
                   className="shadow-none border-0 rounded-none bg-transparent"
               />

               {/* AI Task Generator Panel */}
               <GenerateTaskPanel topicId={selectedSkillSet.id} />
             </div>

             <div className="p-4 border-t bg-muted/20 flex justify-between items-center shrink-0">
                 <Button variant="outline" onClick={handlePrev} disabled={!hasPrev}>
                   Previous
                 </Button>
                 <Button variant="outline" onClick={handleNext} disabled={!hasNext}>
                   Next
                 </Button>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showControls && (
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-9 bg-background/50 backdrop-blur-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
             <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {uniqueTopics.map(t => (
               <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {sorted.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer group hover:shadow-md transition-all"
            onClick={() => handleOpen(item)}
          >
            <CardContent className="p-4">
              <div className="space-y-1">
              <div className="font-bold text-lg">
                  {item.topic}
              </div>
              <div className="text-muted-foreground font-medium">
                  {item.theme}
              </div>
              <div className="flex gap-2 pt-2">
                  {item.week && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{item.week}</Badge>}
              </div>
            </div>
            </CardContent>
          </Card>
        ))}

        {skillSets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No questions found matching your search.
            </div>
        )}
      </div>
    </div>
  );
}
