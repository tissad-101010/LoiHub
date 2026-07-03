import { Database, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DatasetHealthProps {
  laws: number
  amendments: number
  deputies: number
  documents: number
  lastSync?: string
  status?: "healthy" | "warning" | "error"
  className?: string
}

function StatusIndicator({ status }: { status: string }) {
  if (status === "healthy") {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm">Healthy</span>
      </div>
    )
  }

  if (status === "warning") {
    return (
      <div className="flex items-center gap-2 text-yellow-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Warning</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-red-600">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">Error</span>
    </div>
  )
}

export function DatasetHealth({
  laws,
  amendments,
  deputies,
  documents,
  lastSync = "Unknown",
  status = "healthy",
  className,
}: DatasetHealthProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dataset Health</CardTitle>

        <Database className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="space-y-5">

        {/* STATUS GLOBAL */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Status
          </span>

          <StatusIndicator status={status} />
        </div>

        {/* METRICS */}
        <div className="space-y-3">

          <div className="flex items-center justify-between">
            <span className="text-sm">Lois</span>
            <span className="font-medium">{laws.toLocaleString("fr-FR")}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Amendements</span>
            <span className="font-medium">
              {amendments.toLocaleString("fr-FR")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Députés</span>
            <span className="font-medium">{deputies}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Documents</span>
            <span className="font-medium">
              {documents.toLocaleString("fr-FR")}
            </span>
          </div>

        </div>

        {/* LAST SYNC */}
        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span>Dernière sync</span>

          <div className="flex items-center gap-2">
            <RefreshCw className="h-3 w-3" />
            <span>{lastSync}</span>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}