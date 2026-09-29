-- CreateTable
CREATE TABLE "QuestVote" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestSubmission" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "nickname" TEXT,
    "ipHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestVote_roundId_voterId_key" ON "QuestVote"("roundId", "voterId");

-- CreateIndex
CREATE INDEX "QuestVote_roundId_ipHash_idx" ON "QuestVote"("roundId", "ipHash");

-- CreateIndex
CREATE INDEX "QuestSubmission_ipHash_createdAt_idx" ON "QuestSubmission"("ipHash", "createdAt");
