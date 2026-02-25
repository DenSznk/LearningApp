-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "answer" TEXT,
    "week" TEXT,
    "topicId" TEXT NOT NULL,
    "skill" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("answer", "difficulty", "id", "text", "topicId", "week") SELECT "answer", "difficulty", "id", "text", "topicId", "week" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
