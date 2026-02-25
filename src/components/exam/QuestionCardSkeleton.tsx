import { Skeleton } from "@/components/ui/skeleton";

export function QuestionCardSkeleton() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b bg-muted/20 flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <div className="p-4 border-t bg-muted/20 flex justify-between items-center shrink-0">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
