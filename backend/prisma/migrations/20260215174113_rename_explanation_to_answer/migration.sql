/*
  Warnings:

  - You are about to drop the `UserGrade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `explanation` on the `Question` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserGrade_userId_questionId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserGrade";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "answer" TEXT,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("difficulty", "id", "text", "topicId") SELECT "difficulty", "id", "text", "topicId" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
