// components/dashboard/dashboard-hero.tsx

import Link from "next/link";
import { ArrowRight, Scale, Search } from "lucide-react";

interface DashboardHeroProps {
  title: string;
  description: string;
}

export function DashboardHero({
  title,
  description,
}: DashboardHeroProps) {
  return (
    <section className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
      <div className="container mx-auto px-6 py-14">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          {/* Texte */}

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground shadow-sm">

              <Scale className="h-4 w-4 text-primary" />

              <span>17e législature</span>

            </div>

            <h1 className="text-5xl font-bold tracking-tight">

              {title}

            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">

              {description}

            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                href="/laws"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90"
              >
                Explorer les lois

                <ArrowRight className="h-4 w-4" />

              </Link>

              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-5 py-3 font-medium transition hover:bg-muted"
              >
                <Search className="h-4 w-4" />

                Rechercher

              </Link>

            </div>

          </div>

          {/* Carte d'information */}

          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Plateforme
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-muted-foreground">
                  Source
                </span>

                <span className="font-medium">
                  Assemblée nationale
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-muted-foreground">
                  Version
                </span>

                <span className="font-medium">
                  Alpha
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-muted-foreground">
                  Backend
                </span>

                <span className="font-medium">
                  PostgreSQL
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-muted-foreground">
                  ORM
                </span>

                <span className="font-medium">
                  Prisma
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}