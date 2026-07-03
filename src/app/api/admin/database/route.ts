import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    sourceFiles,
    deputies,
    dossiers,
    laws,
    lawVersions,
    amendments,
    debates,
    votes,
    entityEdges,
  ] = await Promise.all([
    prisma.sourceFile.findMany({ orderBy: { importedAt: "desc" } }),

    prisma.deputy.findMany({
      include: {
        amendments: true,
        votes: true,
        debates: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    prisma.dossier.findMany({
      include: {
        laws: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    prisma.law.findMany({
      include: {
        dossier: true,
        versions: true,
        amendments: true,
        debates: true,
        votes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    prisma.lawVersion.findMany({
      include: {
        law: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    prisma.amendment.findMany({
      include: {
        deputy: true,
        law: true,
        votes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),

    prisma.debate.findMany({
      include: {
        law: true,
        deputy: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    prisma.vote.findMany({
      include: {
        law: true,
        amendment: true,
        deputy: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),

    prisma.entityEdge.findMany({
      take: 100,
    }),
  ]);

  return NextResponse.json({
    sourceFiles,
    deputies,
    dossiers,
    laws,
    lawVersions,
    amendments,
    debates,
    votes,
    entityEdges,
  });
}