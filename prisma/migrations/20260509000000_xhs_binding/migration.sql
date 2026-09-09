CREATE TABLE IF NOT EXISTS "XhsBinding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedSession" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "label" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XhsBinding_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "XhsBinding_userId_key" ON "XhsBinding"("userId");

DO $$ BEGIN
  ALTER TABLE "XhsBinding" ADD CONSTRAINT "XhsBinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
