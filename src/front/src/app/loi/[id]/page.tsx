import LoiPageClient from "@/components/LoiPageClient";

export default async function LoiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LoiPageClient dossierId={id} />;
}
