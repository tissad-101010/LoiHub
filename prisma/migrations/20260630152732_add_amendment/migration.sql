-- AlterTable
ALTER TABLE "Amendment" ADD COLUMN     "article" TEXT,
ADD COLUMN     "numeroLong" TEXT;

-- CreateIndex
CREATE INDEX "Amendment_lawId_idx" ON "Amendment"("lawId");

-- CreateIndex
CREATE INDEX "Amendment_deputyId_idx" ON "Amendment"("deputyId");

-- CreateIndex
CREATE INDEX "Amendment_article_idx" ON "Amendment"("article");
