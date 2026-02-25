"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SkillSet, TOPICS } from '@/lib/data';
import { fetchSkillSet } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

// ... imports

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
  const [showAnswer, setShowAnswer] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'week' | 'topic'>('default');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const sorted = [...skillSets].sort((a, b) => {
    if (sortBy === 'week') {
      const weekA = parseInt(a.week?.replace(/\D/g, '') || '999');
      const weekB = parseInt(b.week?.replace(/\D/g, '') || '999');
      return weekA - weekB;
    }
    if (sortBy === 'topic') {
      const indexA = TOPICS.indexOf(a.topic as any);
      const indexB = TOPICS.indexOf(b.topic as any);
      const validIndexA = indexA === -1 ? 999 : indexA;
      const validIndexB = indexB === -1 ? 999 : indexB;

      if (validIndexA !== validIndexB) {
        return validIndexA - validIndexB;
      }
      return a.topic.localeCompare(b.topic);
    }
    return 0;
  });

  const handleOpen = async (skillSet: SkillSet) => {
    setIsLoadingDetails(true);
    try {
        const details = await fetchSkillSet(skillSet.id);
        setSelectedSkillSet(details);
        setSelectedLevelId('1');
        setShowAnswer(false);
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
              level: parseInt(selectedLevelId) as any,
              skill: levelData.skill,
              shortAnswer: selectedSkillSet.shortAnswer,
              codeExample: selectedSkillSet.codeExample,
              answer: levelData.answer,
          };
      }
  }

  const currentIndex = selectedSkillSet ? sorted.findIndex(q => q.id === selectedSkillSet.id) : -1;
  const hasNext = currentIndex < sorted.length - 1;
  const hasPrev = currentIndex > 0;

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
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
             <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="topic">Topic</SelectItem>
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

      <Dialog open={!!selectedSkillSet} onOpenChange={(open) => !open && setSelectedSkillSet(null)}>
        <DialogContent className="max-w-3xl p-0 sm:max-w-[920px] overflow-hidden flex flex-col max-h-[90vh]">
          {isLoadingDetails ? (
              <div className="p-8 text-center">
                <DialogTitle className="sr-only">Loading...</DialogTitle>
                Loading details...
              </div>
          ) : !selectedSkillSet || !activeQuestion ? (
              <div className="p-8 text-center">
                <DialogTitle className="sr-only">No Content</DialogTitle>
                No question available for this level.
              </div>
          ) : (
            <>
              <DialogTitle className="sr-only">{selectedSkillSet.topic} - {selectedSkillSet.theme}</DialogTitle>
              <div className="p-4 border-b bg-muted/20 flex gap-2 overflow-x-auto">
                 {selectedSkillSet.levels && Object.keys(selectedSkillSet.levels).map((levelKey) => (
                     <Button
                        key={levelKey}
                        variant={selectedLevelId === levelKey ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => {
                            setSelectedLevelId(levelKey);
                            setShowAnswer(false);
                        }}
                        className="text-xs"
                     >
                        Level {levelKey}
                     </Button>
                 ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                <QuestionCard
                    question={activeQuestion as any}
                    showAnswer={showAnswer}
                    onToggleAnswer={() => setShowAnswer(!showAnswer)}
                    className="shadow-none border-0 rounded-none bg-transparent"
                />
              </div>

              <div className="p-4 border-t bg-muted/20 flex justify-between items-center shrink-0">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={!hasPrev}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {currentIndex + 1} of {sorted.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={!hasNext}
                  >
                    Next
                  </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
