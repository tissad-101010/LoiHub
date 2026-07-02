/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `Amendment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `Deputy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `Law` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Amendment" ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "uid" TEXT;

-- AlterTable
ALTER TABLE "Debate" ADD COLUMN     "sourceId" TEXT;

-- AlterTable
ALTER TABLE "Deputy" ADD COLUMN     "raw" JSONB,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "uid" TEXT;

-- AlterTable
ALTER TABLE "Law" ADD COLUMN     "dossierId" TEXT,
ADD COLUMN     "raw" JSONB,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "uid" TEXT;

-- CreateTable
CREATE TABLE "SourceFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "hash" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dossier" (
    "id" TEXT NOT NULL,
    "uid" TEXT,
    "title" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityEdge" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "EntityEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceFile_path_key" ON "SourceFile"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Dossier_uid_key" ON "Dossier"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Amendment_uid_key" ON "Amendment"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Deputy_uid_key" ON "Deputy"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Law_uid_key" ON "Law"("uid");

-- AddForeignKey
ALTER TABLE "Deputy" ADD CONSTRAINT "Deputy_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Law" ADD CONSTRAINT "Law_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Law" ADD CONSTRAINT "Law_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amendment" ADD CONSTRAINT "Amendment_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debate" ADD CONSTRAINT "Debate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
