-- CreateEnum
CREATE TYPE "LawStatus" AS ENUM ('DRAFT', 'IN_DEBATE', 'VOTED', 'ADOPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AmendmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VoteValue" AS ENUM ('FOR', 'AGAINST', 'ABSTAIN');

-- CreateTable
CREATE TABLE "Deputy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deputy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Law" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "LawStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Law_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawVersion" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "lawId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LawVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amendment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "AmendmentStatus" NOT NULL DEFAULT 'PENDING',
    "lawId" TEXT NOT NULL,
    "deputyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Amendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Debate" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lawId" TEXT NOT NULL,
    "deputyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Debate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "value" "VoteValue" NOT NULL,
    "lawId" TEXT,
    "amendmentId" TEXT,
    "deputyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LawVersion" ADD CONSTRAINT "LawVersion_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amendment" ADD CONSTRAINT "Amendment_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amendment" ADD CONSTRAINT "Amendment_deputyId_fkey" FOREIGN KEY ("deputyId") REFERENCES "Deputy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debate" ADD CONSTRAINT "Debate_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debate" ADD CONSTRAINT "Debate_deputyId_fkey" FOREIGN KEY ("deputyId") REFERENCES "Deputy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_amendmentId_fkey" FOREIGN KEY ("amendmentId") REFERENCES "Amendment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_deputyId_fkey" FOREIGN KEY ("deputyId") REFERENCES "Deputy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
