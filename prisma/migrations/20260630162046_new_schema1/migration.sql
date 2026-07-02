/*
  Warnings:

  - You are about to drop the column `raw` on the `Amendment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Law` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rawJson` to the `Amendment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalId` to the `Law` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Amendment" DROP CONSTRAINT "Amendment_lawId_fkey";

-- AlterTable
ALTER TABLE "Amendment" DROP COLUMN "raw",
ADD COLUMN     "rawJson" JSONB NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "lawId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Law" ADD COLUMN     "externalId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Law_externalId_key" ON "Law"("externalId");

-- AddForeignKey
ALTER TABLE "Amendment" ADD CONSTRAINT "Amendment_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE SET NULL ON UPDATE CASCADE;
