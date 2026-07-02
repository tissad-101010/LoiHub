/*
  Warnings:

  - Added the required column `raw` to the `Amendment` table without a default value. This is not possible if the table is not empty.
  - Made the column `uid` on table `Amendment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Amendment_article_idx";

-- DropIndex
DROP INDEX "Amendment_deputyId_idx";

-- DropIndex
DROP INDEX "Amendment_lawId_idx";

-- AlterTable
ALTER TABLE "Amendment" ADD COLUMN     "alinea" TEXT,
ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "dateDepot" TIMESTAMP(3),
ADD COLUMN     "datePublication" TIMESTAMP(3),
ADD COLUMN     "dateSort" TIMESTAMP(3),
ADD COLUMN     "examenRef" TEXT,
ADD COLUMN     "numeroOrdreDepot" TEXT,
ADD COLUMN     "prefixeOrganeExamen" TEXT,
ADD COLUMN     "raw" JSONB NOT NULL,
ADD COLUMN     "sort" TEXT,
ADD COLUMN     "texteLegislatifRef" TEXT,
ALTER COLUMN "uid" SET NOT NULL;
