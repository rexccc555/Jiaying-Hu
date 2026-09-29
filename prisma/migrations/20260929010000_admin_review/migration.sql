-- AlterTable
ALTER TABLE "QuestSubmission" ADD COLUMN "title" TEXT,
ADD COLUMN "zone" TEXT,
ADD COLUMN "difficulty" INTEGER,
ADD COLUMN "xp" INTEGER,
ADD COLUMN "desc" TEXT,
ADD COLUMN "roundId" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "QuestSubmission_roundId_idx" ON "QuestSubmission"("roundId");

-- CreateTable
CREATE TABLE "GameSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSetting_pkey" PRIMARY KEY ("key")
);
