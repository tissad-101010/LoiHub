-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "uid" TEXT,
    "number" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "raw" JSONB,
    "lawId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_uid_key" ON "Article"("uid");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;
