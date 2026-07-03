import {
  FileText,
  FolderGit2,
  PenSquare,
  Users,
  Database,
} from "lucide-react";

import { StatCard } from "@/components/ui/card";

interface DashboardStatsProps {
  stats: {
    laws: number;
    dossiers: number;
    amendments: number;
    deputies: number;
    documents: number;
  };
}

export function DashboardStats({
  stats,
}: DashboardStatsProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Lois"
        value={stats.laws}
        description="Documents législatifs"
        icon={FileText}
      />

      <StatCard
        title="Dossiers"
        value={stats.dossiers}
        description="Procédures parlementaires"
        icon={FolderGit2}
      />

      <StatCard
        title="Amendements"
        value={stats.amendments}
        description="Modifications proposées"
        icon={PenSquare}
      />

      <StatCard
        title="Députés"
        value={stats.deputies}
        description="Acteurs politiques"
        icon={Users}
      />

      <StatCard
        title="Documents"
        value={stats.documents}
        description="Documents indexés"
        icon={Database}
      />
    </section>
  );
}