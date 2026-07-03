import {
  Activity,
  FileText,
  PenLine,
  Users,
  GitBranch,
} from "lucide-react"

import { LucideIcon } from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  title: string
  time: string
  type?: "law" | "amendment" | "deputy" | "dossier" | "system"
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  icon?: LucideIcon
  className?: string
}

function getIcon(type?: string) {
  switch (type) {
    case "law":
      return FileText
    case "amendment":
      return PenLine
    case "deputy":
      return Users
    case "dossier":
      return GitBranch
    default:
      return Activity
  }
}

function getDotColor(type?: string) {
  switch (type) {
    case "law":
      return "bg-blue-500"
    case "amendment":
      return "bg-yellow-500"
    case "deputy":
      return "bg-purple-500"
    case "dossier":
      return "bg-green-500"
    default:
      return "bg-gray-400"
  }
}

export function ActivityFeed({
  activities,
  icon: Icon,
  className,
}: ActivityFeedProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activité récente</CardTitle>

        {Icon ? (
          <Icon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Activity className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune activité
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getIcon(activity.type)

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3"
                >
                  {/* timeline dot */}
                  <div className="relative mt-1 flex flex-col items-center">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        getDotColor(activity.type)
                      )}
                    />

                    {/* ligne verticale */}
                    <div className="h-full w-px bg-border mt-1" />
                  </div>

                  {/* icon */}
                  <div className="rounded-md bg-muted p-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* content */}
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}