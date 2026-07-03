import {
  Clock,
  FileText,
  PenLine,
  GitBranch,
  ArrowRight,
} from "lucide-react"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TimelineEvent {
  id: string
  title: string
  description?: string
  time: string
  type?: "law" | "amendment" | "dossier" | "system"
}

interface TimelinePreviewProps {
  events: TimelineEvent[]
  className?: string
}

function getIcon(type?: string) {
  switch (type) {
    case "law":
      return FileText
    case "amendment":
      return PenLine
    case "dossier":
      return GitBranch
    default:
      return Clock
  }
}

function getColor(type?: string) {
  switch (type) {
    case "law":
      return "bg-blue-500"
    case "amendment":
      return "bg-yellow-500"
    case "dossier":
      return "bg-green-500"
    default:
      return "bg-gray-400"
  }
}

export function TimelinePreview({
    events,
  className,
}: TimelinePreviewProps) {
    const safeEvents = Array.isArray(events) ? events : []
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline</CardTitle>

        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        {safeEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun événement
          </p>
        ) : (
          <div className="space-y-5">
            {safeEvents.map((event, index) => {
              const Icon = getIcon(event.type)

              return (
                <div key={event.id} className="flex gap-3">

                  {/* timeline column */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        getColor(event.type)
                      )}
                    />

                    {index !== events.length - 1 && (
                      <div className="h-full w-px bg-border mt-1" />
                    )}
                  </div>

                  {/* icon */}
                  <div className="rounded-md bg-muted p-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* content */}
                  <div className="flex flex-1 items-start justify-between gap-3">

                    <div>
                      <p className="text-sm font-medium">
                        {event.title}
                      </p>

                      {event.description && (
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-1">
                        {event.time}
                      </p>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <Link
          href="/timeline"
          className="
            mt-4 flex items-center justify-between rounded-lg border
            bg-background px-4 py-2 text-sm transition
            hover:bg-muted/40
          "
        >
          <span>Voir toute la timeline</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

      </CardContent>
    </Card>
  )
}