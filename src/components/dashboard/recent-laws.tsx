import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Law {
  id: string
  title: string
  type: string
  legislature: string
  date?: string
}

interface RecentLawsProps {
  laws: Law[]
}

export function RecentLaws({ laws }: RecentLawsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lois récentes</CardTitle>

        <Link
          href="/laws"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {laws.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune loi disponible
          </p>
        ) : (
          laws.map((law) => (
            <Link
              key={law.id}
              href={`/law/${law.id}`}
              className="
                flex items-start gap-3 rounded-lg border
                p-3 transition hover:bg-muted/40
              "
            >
              {/* Icon */}
              <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium line-clamp-1">
                    {law.title}
                  </p>

                  <span className="text-xs text-muted-foreground">
                    L{law.legislature}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{law.type}</span>

                  {law.date && <span>{law.date}</span>}
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}