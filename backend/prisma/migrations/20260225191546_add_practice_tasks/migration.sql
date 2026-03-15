-- AlterTable
ALTER TABLE "Topic" ADD COLUMN "codeExample" TEXT;
ALTER TABLE "Topic" ADD COLUMN "shortAnswer" TEXT;
ALTER TABLE "Topic" ADD COLUMN "week" TEXT;

-- CreateTable
CREATE TABLE "PracticeTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "candidateCode" TEXT NOT NULL,
    "interviewerSolution" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeTask_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
