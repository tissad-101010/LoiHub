import Link from "next/link"
import { PenLine, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Amendment {
  id: string
  article?: string
  author?: string
  status: "Adopté" | "Rejeté" | "En discussion" | string
}

interface RecentAmendmentsProps {
  amendments: Amendment[]
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "adopté":
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case "rejeté":
      return "bg-red-500/10 text-red-600 border-red-500/20"
    default:
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
  }
}

export function RecentAmendments({
  amendments,
}: RecentAmendmentsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Amendements récents</CardTitle>

        <Link
          href="/amendments"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {amendments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun amendement disponible
          </p>
        ) : (
          amendments.map((amendment) => (
            <Link
              key={amendment.id}
              href={`/amendments/${amendment.id}`}
              className="
                flex items-start gap-3 rounded-lg border
                p-3 transition hover:bg-muted/40
              "
            >
              {/* Icon */}
              <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                <PenLine className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-1">

                <div className="flex items-center justify-between gap-2">

                  <p className="text-sm font-medium">
                    Amendement {amendment.id}
                  </p>

                  {amendment.article && (
                    <span className="text-xs text-muted-foreground">
                      {amendment.article}
                    </span>
                  )}

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-xs text-muted-foreground">
                    {amendment.author ?? "Auteur inconnu"}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`
                      text-xs px-2 py-0.5 rounded-full border
                      ${getStatusColor(amendment.status)}
                    `}
                  >
                    {amendment.status}
                  </span>

                </div>

              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}