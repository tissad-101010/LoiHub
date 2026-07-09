import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Contrôle d'existence AVANT la frontière de streaming : loading.tsx fait
// partir le shell (statut 200) dès le rendu de la page — un notFound() dans la
// page arrive trop tard pour le code HTTP. Le layout, lui, est rendu avant le
// premier octet : un dossier inconnu répond donc bien 404.
export default async function LoiLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const existe = await prisma.dossier.findUnique({
    where: { uid: decodeURIComponent(id) },
    select: { id: true },
  });
  if (!existe) notFound();
  return children;
}
