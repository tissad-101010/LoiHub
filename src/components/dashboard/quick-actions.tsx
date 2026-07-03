import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Action {
  label: string
  href: string
  icon: LucideIcon
  description?: string
}

interface QuickActionsProps {
  actions: Action[]
  className?: string
}

export function QuickActions({
  actions,
  className,
}: QuickActionsProps) {
  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.href}
                href={action.href}
                className="
                  group flex items-center gap-3 rounded-xl border
                  bg-background p-4 transition
                  hover:border-primary/40 hover:bg-muted/40
                "
              >
                <div
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-lg bg-primary/10 text-primary
                    group-hover:bg-primary group-hover:text-white
                    transition
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {action.label}
                  </span>

                  {action.description && (
                    <span className="text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}